#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = [
#   "kokoro>=0.9.4",
#   "en-core-web-sm @ https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl",
# ]
# ///
"""
Generate narration for the mock-exam web app with a local TTS model (Kokoro-82M).

Reads the generated question bank (mock-exam-app/public/questions.js) and writes
one MP3 per spoken segment to mock-exam-app/public/audio/, plus manifest.js
(window.EXAM_AUDIO) that the app uses to find the clips.

Answer options are shuffled in the app on every attempt, so options and
explanations are separate clips keyed by their source letter. The app plays
them in on-screen order with short "Option A." label clips in between.

Segments:
    sc{N}          case-study brief (title, setup, goal, constraints)
    s{N}q{M}       question stem (scenario paragraph + question line)
    s{N}q{M}-o{K}  option K text
    s{N}q{M}-w{K}  explanation for option K
    lbl-{A..D}     "Option A." ... (on-screen letter)
    lbl-ok/lbl-bad "Correct answer." / "Incorrect."

Clips are only re-rendered when their text, voice or speed changes, so it is
cheap to re-run after editing a few questions.

Usage (needs an NVIDIA GPU for speed; falls back to CPU):
    uv run scripts/tts_mock_exam.py                  # render everything that changed
    uv run scripts/tts_mock_exam.py --only s3q2      # one question (prefix match)
    uv run scripts/tts_mock_exam.py --dry-run        # print the normalized text only
    uv run scripts/tts_mock_exam.py --voice am_michael --speed 1.05 --force
"""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUESTIONS = ROOT / "mock-exam-app" / "public" / "questions.js"
OUT_DIR = ROOT / "mock-exam-app" / "public" / "audio"
MANIFEST = OUT_DIR / "manifest.js"
SAMPLE_RATE = 24000
LETTERS = "ABCD"

# Spoken forms the TTS front-end gets wrong on its own. Matched as whole words, case-sensitive.
SAY = {
    "SPIFFE": "spiffy",
    "IAM": "eye-am",
    "UVX": "U V X",
    "pgvector": "P G vector",
    "e.g.": "for example",
    "i.e.": "that is",
    "vs.": "versus",
    "→": " to ",
    " > ": " greater than ",
    "if/else": "if-else",
}


def load_bank():
    s = QUESTIONS.read_text()
    return json.loads(s[s.index("{"): s.rstrip().rstrip(";").rindex("}") + 1])


def speak_code(code):
    """Turn an identifier or command into something readable aloud."""
    code = code.strip().rstrip(":")
    code = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", code)          # CamelCase -> Camel Case
    code = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", code)        # HTTPConnection -> HTTP Connection
    code = code.replace("$", "").replace("_", " ").replace("/", " slash ")
    code = re.sub(r"(?<=\w)\.(?=\w)", " dot ", code)
    code = re.sub(r"(?<=\w)[:-](?=\w)", " ", code)
    code = re.sub(r"\s--?(?=\w)", " ", code)                     # CLI flags
    code = code.replace("!=", " is not ").replace("==", " equals ")
    code = re.sub(r"\b(cli|mcp|Mcp|sql|llm|Llm|api|url|http|HTTPS?|Http|uvx|id)\b", lambda m: m.group(1).upper(), code)
    return re.sub(r"\s+", " ", code).strip()


def normalize(text):
    text = re.sub(r"`([^`]+)`", lambda m: speak_code(m.group(1)), text or "")
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"(?<![\w*])\*([^*\s][^*]*?)\*(?!\*)", r"\1", text)
    for k, v in SAY.items():
        pat = re.escape(k) if not k[0].isalnum() else rf"\b{re.escape(k)}(?=\W|$)"
        text = re.sub(pat, v, text)
    text = re.sub(r"\s*\n\s*", " ", text)
    return re.sub(r"\s{2,}", " ", text).strip()


def ensure_stop(s):
    s = s.strip()
    return s if not s or s[-1] in ".?!:" else s + "."


def segments(bank, only=None):
    segs = {}
    for L in LETTERS:
        segs[f"lbl-{L}"] = f"Option {L}."
    segs["lbl-ok"] = "Correct answer."
    segs["lbl-bad"] = "Incorrect."

    for sc in bank["scenarios"]:
        parts = [f"Case study {sc['id']}. {ensure_stop(sc['title'])}", "Setup.", ensure_stop(sc["context"])]
        if sc.get("goal"):
            parts += ["Goal.", ensure_stop(sc["goal"])]
        if sc.get("constraints"):
            parts.append("Constraints.")
            parts += [ensure_stop(c) for c in sc["constraints"]]
        segs[f"sc{sc['id']}"] = "\n".join(parts)

    for q in bank["questions"]:
        parts = [ensure_stop(q["context"])]
        if q.get("goal"):
            parts += ["Goal.", ensure_stop(q["goal"])]
        if q.get("constraints"):
            parts.append("Constraints.")
            parts += [ensure_stop(c) for c in q["constraints"]]
        parts.append(q["prompt"])
        segs[q["id"]] = "\n".join(parts)
        for k, v in q["options"].items():
            segs[f"{q['id']}-o{k}"] = ensure_stop(v)
        for k, v in q["why"].items():
            segs[f"{q['id']}-w{k}"] = ensure_stop(v)

    segs = {k: normalize(v) for k, v in segs.items()}
    if only:
        segs = {k: v for k, v in segs.items() if any(k.startswith(o) for o in only)}
    return segs


def load_manifest():
    if not MANIFEST.exists():
        return {}
    s = MANIFEST.read_text()
    try:
        return json.loads(s[s.index("{"): s.rstrip().rstrip(";").rindex("}") + 1]).get("clips", {})
    except ValueError:
        return {}


def write_manifest(clips, voice, speed):
    data = {"voice": voice, "speed": speed, "clips": dict(sorted(clips.items()))}
    MANIFEST.write_text(
        "// Generated by scripts/tts_mock_exam.py. Do not edit by hand.\n"
        f"window.EXAM_AUDIO = {json.dumps(data, indent=1)};\n"
    )


def encode_mp3(samples, path):
    """float32 mono PCM -> MP3 via ffmpeg (speech-grade 48 kbps)."""
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SAMPLE_RATE), "-ac", "1", "-i", "-",
         "-codec:a", "libmp3lame", "-b:a", "48k", str(path)],
        input=samples.astype("float32").tobytes(), check=True,
    )


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--voice", default="af_heart", help="Kokoro voice id, e.g. af_heart, af_bella, am_michael, bf_emma, bm_george")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--only", nargs="*", help="only segments whose key starts with one of these (e.g. sc3 s3q2)")
    ap.add_argument("--force", action="store_true", help="re-render even if the text is unchanged")
    ap.add_argument("--dry-run", action="store_true", help="print the text that would be spoken and exit")
    ap.add_argument("--cpu", action="store_true", help="run on CPU instead of CUDA")
    args = ap.parse_args()

    segs = segments(load_bank(), args.only)
    if args.dry_run:
        for k, v in segs.items():
            print(f"[{k}] {v}\n")
        return

    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is required (sudo apt install ffmpeg)")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    clips = load_manifest()

    def digest(text):
        return hashlib.sha1(f"{args.voice}|{args.speed}|{text}".encode()).hexdigest()[:10]

    todo = [k for k, v in segs.items()
            if args.force or clips.get(k, {}).get("h") != digest(v) or not (OUT_DIR / f"{k}.mp3").exists()]
    print(f"{len(segs)} segments, {len(todo)} to render with voice {args.voice} @ {args.speed}x")

    if todo:
        import numpy as np
        import torch
        from kokoro import KPipeline

        device = "cuda" if torch.cuda.is_available() and not args.cpu else "cpu"
        print(f"device: {device}" + (f" ({torch.cuda.get_device_name(0)})" if device == "cuda" else ""))
        pipe = KPipeline(lang_code=args.voice[0], device=device, repo_id="hexgrad/Kokoro-82M")
        gap = np.zeros(int(SAMPLE_RATE * 0.25), dtype=np.float32)

        for i, key in enumerate(todo, 1):
            text = segs[key]
            chunks = []
            # split on sentence boundaries so long passages get natural pauses
            for _, _, audio in pipe(text, voice=args.voice, speed=args.speed, split_pattern=r"(?<=[.?!:])\s+(?=[A-Z0-9\"'(])"):
                if audio is not None:
                    chunks += [audio.numpy() if hasattr(audio, "numpy") else np.asarray(audio), gap]
            samples = np.concatenate(chunks[:-1]) if chunks else gap
            encode_mp3(samples, OUT_DIR / f"{key}.mp3")
            clips[key] = {"h": digest(text), "d": round(len(samples) / SAMPLE_RATE, 1)}
            print(f"  [{i}/{len(todo)}] {key}  {clips[key]['d']}s")
            if i % 25 == 0:
                write_manifest(clips, args.voice, args.speed)

    # drop clips whose segment no longer exists (only on a full run)
    if not args.only:
        all_keys = set(segs)
        for k in [k for k in clips if k not in all_keys]:
            clips.pop(k)
            (OUT_DIR / f"{k}.mp3").unlink(missing_ok=True)
    write_manifest(clips, args.voice, args.speed)
    total = sum(c["d"] for c in clips.values())
    print(f"done: {len(clips)} clips, {total / 60:.1f} min of audio -> {OUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
