# Agentic Architect Mock Exam

A scenario-based mock exam for the **Google Cloud Professional Agentic Architect** certification, deployed as a static site on **Firebase Hosting**. It has no backend: all progress stays in the browser of the person using it.

- **50 questions** from **10 case studies**, covering all 5 exam domains.
- **A diagram for every case study.** It shows the setup and constraints. The design decision each question asks about is marked with an amber **?**, so the diagram never gives away an answer.
- **Answer options are shuffled every attempt.** Each explanation stays attached to its option.
- **Five modes:**

  | Mode | Questions | Timer | Feedback |
  | --- | --- | --- | --- |
  | Full mock exam | 50 | 120 min | After submit; compared with your personal best |
  | Quick exam | 20 random | 45 min | After submit |
  | Case study drill | 5 | — | After each answer, with a streak counter |
  | Domain drill | All questions for one domain | — | After each answer |
  | Review mistakes | Questions you last got wrong | — | After each answer |

- **Results screen:** score, change since your last attempt at the same mode, personal best, breakdown by domain and by case study, and a review of every question with an explanation for each option and your record on it.
- **Narration:** every case-study brief, question, option and explanation has a narrated clip. The clips are generated locally with an open TTS model. **Listen** reads the question and its options in the order shown on screen. After an answer is revealed, **Explanations** reads the correct option first, then the others. You can change the speed (1× / 1.25× / 1.5× / 0.85×), and the option being read is highlighted.
- **Single-user and private:** nothing leaves the browser. `localStorage` keeps unfinished sessions (with a Resume option), attempt history, and a record for every question (attempts, correct answers, last result). The home screen's **Your progress** card shows questions seen, mastered (correct on the latest attempt), overall accuracy, best full exam and per-domain mastery, and has a reset button.

## Project structure

```
mock-exam/                      ← source of truth (markdown)
├── exam-format.md              ← exam guide / domain notes
├── exam-mock-scenarios.md      ← the 10 case-study briefs
└── mock-qa-scenario-{1..10}.md ← 5 questions per case study
scripts/build_mock_exam.py      ← markdown → public/questions.js
scripts/tts_mock_exam.py        ← questions.js → public/audio/*.mp3 (local Kokoro TTS)
mock-exam-app/
├── firebase.json               ← hosting target "mock-exam", emulator ports
├── .firebaserc                 ← project agy-sandbox-4a603, target → site "agy-mock-exam"
└── public/
    ├── index.html
    ├── style.css               ← light/dark theme tokens, diagram styles
    ├── questions.js            ← GENERATED question bank (window.EXAM_DATA)
    ├── diagrams.js             ← inline-SVG case-study diagrams
    ├── audio/                  ← GENERATED narration clips + manifest.js (window.EXAM_AUDIO)
    └── app.js                  ← exam engine, UI, results, on-device progress
```

## Editing questions

Edit the markdown in `mock-exam/`, then regenerate:

```bash
python3 scripts/build_mock_exam.py
```

The parser checks that every question has options A–D, a correct answer, a prompt, a context and one explanation per option. If anything is missing it stops with an error naming the question, for example `s3q2: missing explanation for ['C']`. Keep the existing markdown layout: `### **Question N (Domain X - Topic)**`, a one-paragraph scenario, a bold question line, `* **A.** …` options, then `#### **Answer & Explanation**` with `Correct Answer:`, `Why it's correct:` and `Why Distractor X fails:`. The topic in the heading is shown only after the question is answered.

Questions are written in the style of the real exam. Requirements are stated as business facts inside the scenario, not as a Goal/Constraints list, and are never phrased with the words of the correct option. Every option should be something a competent engineer might choose, and options should be similar in length and detail. (The parser still accepts optional `**Context:**`, `**Goal:**` and `**Constraints:**` labels.)

Diagrams are hand-laid-out SVG in `public/diagrams.js`, one function per scenario id. A new scenario still works without a diagram; it just won't have a picture.

## Narration (local TTS)

`scripts/tts_mock_exam.py` renders the narration with [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), an open model (Apache-2.0) that runs on your own GPU. It is a `uv` inline script, so `uv` installs torch and kokoro on first run. You also need `ffmpeg`.

```bash
python3 scripts/build_mock_exam.py         # refresh questions.js first
uv run scripts/tts_mock_exam.py            # renders only the clips whose text changed
uv run scripts/tts_mock_exam.py --dry-run  # print the text that would be spoken
uv run scripts/tts_mock_exam.py --only s3q2 sc3          # just these segments
uv run scripts/tts_mock_exam.py --voice am_michael --force   # re-voice everything
```

Answer options are shuffled every attempt, so the script makes one clip per segment rather than one per question: the brief (`sc{N}`), the stem (`s{N}q{M}`), each option (`-o{K}`), each explanation (`-w{K}`) and short "Option A." label clips. The app puts them into a playlist in on-screen order. Each clip's hash is stored in `audio/manifest.js`, so re-runs are incremental and browsers fetch fresh files (`?v=<hash>`). A full render of about 107 minutes of audio takes about 2 minutes on an RTX 4070 and is about 38 MB of 48 kbps MP3.

If the TTS mispronounces a term, add it to `SAY` in the script (whole-word replacements). Code spans are read as words, so `sub_agents` becomes "sub agents" and `roles/aiplatform.user` becomes "roles slash aiplatform dot user". If `audio/manifest.js` is missing, the app hides the narration controls.

## Firebase setup

This app is a **second Hosting site** in the same Firebase project as `agy-game` (`agy-sandbox-4a603`), so both apps stay online.

1. Create the Hosting site (one time):
   ```bash
   cd mock-exam-app
   ../agy-game/firebase hosting:sites:create agy-mock-exam
   ```
   If that site ID is taken, choose another one and update it in `.firebaserc` (`targets → hosting → mock-exam`).
The app does not use Firestore or Authentication. Firestore rules for the project live in `agy-game/firestore.rules`.

## Run locally

```bash
cd mock-exam-app
../agy-game/firebase emulators:start --only hosting
# open http://127.0.0.1:5002
```

Opening `public/index.html` directly from disk also works.

## Deploy

```bash
cd mock-exam-app
python3 ../scripts/build_mock_exam.py                          # refresh questions.js
../agy-game/firebase deploy --only hosting:mock-exam
```

The app is served at `https://agy-mock-exam.web.app` (or whatever site ID you chose).

## Keyboard shortcuts

`1`–`4` or `A`–`D` select an option · `Enter` submit the answer (practice) / go to the next question. It works even when another button has focus; use `Space` to press the focused button · `N` or `→` next (skips an unanswered practice question) · `←` previous · `F` flag · `L` listen to the question · `E` listen to the explanations (after answering) · `R` replay the current narration from the start · `Esc` close the navigator.
