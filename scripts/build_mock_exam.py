#!/usr/bin/env python3
"""
Build the question bank for the mock-exam web app.

Parses mock-exam/exam-mock-scenarios.md (scenario briefs) and
mock-exam/mock-qa-scenario-*.md (5 questions per scenario) into
mock-exam-app/public/questions.js, which sets window.EXAM_DATA.

Usage:
    python3 scripts/build_mock_exam.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "mock-exam"
OUT = ROOT / "mock-exam-app" / "public" / "questions.js"

LABEL_RE = re.compile(r"^\*\*(Context|Goal|Constraints)(?:/[A-Za-z]+)?:\*\*\s*(.*)$")
OPTION_RE = re.compile(r"^\*\s+\*\*([A-D])\.\*\*\s*(.*)$")
BULLET_RE = re.compile(r"^\s*\*\s+(.*)$")
QUESTION_RE = re.compile(r"^###\s+\*\*Question\s+(\d+)\s*(?:\((.*)\))?\*\*\s*$")
CORRECT_RE = re.compile(r"Correct Answer:\s*([A-D])")
WHY_CORRECT_RE = re.compile(r"^\s*\*\s+\*\*Why it'?s correct:\*\*\s*(.*)$")
WHY_WRONG_RE = re.compile(r"^\s*\*\s+\*\*Why Distractor ([A-D]) fails:\*\*\s*(.*)$")


def domains_from(text):
    return sorted({int(d) for d in re.findall(r"Domain\s+(\d)", text or "")})


def parse_scenarios():
    text = (SRC / "exam-mock-scenarios.md").read_text()
    scenarios = {}
    blocks = re.split(r"^### \*\*Scenario (\d+): (.+?)\*\*\s*$", text, flags=re.M)
    # blocks = [preamble, num, title, body, num, title, body, ...]
    for i in range(1, len(blocks), 3):
        num, title, body = int(blocks[i]), blocks[i + 1].strip(), blocks[i + 2]
        sc = {"id": num, "title": title, "context": "", "goal": "", "constraints": [], "domains": []}
        section = None
        for line in body.splitlines():
            m = re.match(r"^\*\s+\*\*(Context/Setup|Goal|Constraints|Primary Exam Domains):\*\*\s*(.*)$", line)
            if m:
                key, rest = m.groups()
                section = key
                if key == "Context/Setup":
                    sc["context"] = rest
                elif key == "Goal":
                    sc["goal"] = rest
                elif key == "Primary Exam Domains":
                    sc["domains"] = domains_from(rest)
                    sc["domainLabel"] = rest
                continue
            b = re.match(r"^\s{2,}\*\s+(.*)$", line)
            if b and section == "Constraints":
                sc["constraints"].append(b.group(1).strip())
        scenarios[num] = sc
    return scenarios


def parse_question(num, header, lines, scenario_id):
    q = {
        "id": f"s{scenario_id}q{num}",
        "scenario": scenario_id,
        "number": num,
        "header": header or "",
        "domains": domains_from(header),
        "context": "",
        "goal": "",
        "constraints": [],
        "prompt": "",
        "options": {},
        "answer": None,
        "why": {},
    }
    try:
        split = next(i for i, l in enumerate(lines) if l.startswith("#### ") and "Answer" in l)
    except StopIteration:
        raise ValueError(f"{q['id']}: no answer section")
    stem, expl = lines[:split], lines[split + 1:]

    section = None
    for line in stem:
        s = line.rstrip()
        if not s.strip() or s.strip() == "---":
            continue
        m = LABEL_RE.match(s)
        if m:
            section = m.group(1).lower()
            if section != "constraints":
                q[section] = m.group(2).strip()
            continue
        m = OPTION_RE.match(s)
        if m:
            section = "option:" + m.group(1)
            q["options"][m.group(1)] = m.group(2).strip()
            continue
        if re.match(r"^\*\*.+\*\*$", s.strip()) and not BULLET_RE.match(s):
            q["prompt"] = s.strip()[2:-2].strip()
            section = "prompt"
            continue
        m = BULLET_RE.match(s)
        if m and section == "constraints":
            q["constraints"].append(m.group(1).strip())
            continue
        # continuation line
        if section in ("context", "goal"):
            q[section] += " " + s.strip()
        elif section and section.startswith("option:"):
            k = section.split(":")[1]
            q["options"][k] += "\n" + s.strip()
        elif section == "constraints" and q["constraints"]:
            q["constraints"][-1] += " " + s.strip()
        elif section == "prompt":
            q["prompt"] += " " + s.strip()
        else:
            q["context"] = (q["context"] + " " + s.strip()).strip()

    key = None
    for line in expl:
        s = line.rstrip()
        if not s.strip() or s.strip() == "---":
            continue
        m = CORRECT_RE.search(s)
        if m and q["answer"] is None:
            q["answer"] = m.group(1)
            key = None
            continue
        m = WHY_CORRECT_RE.match(s)
        if m:
            key = q["answer"]
            q["why"][key] = m.group(1).strip()
            continue
        m = WHY_WRONG_RE.match(s)
        if m:
            key = m.group(1)
            q["why"][key] = m.group(2).strip()
            continue
        if key:
            q["why"][key] += "\n" + s.strip()

    problems = []
    if sorted(q["options"]) != ["A", "B", "C", "D"]:
        problems.append(f"options={sorted(q['options'])}")
    if q["answer"] not in q["options"]:
        problems.append(f"answer={q['answer']}")
    if not q["prompt"]:
        problems.append("missing prompt")
    if not q["context"]:
        problems.append("missing context")
    missing_why = [k for k in "ABCD" if k not in q["why"]]
    if missing_why:
        problems.append(f"missing explanation for {missing_why}")
    if problems:
        raise ValueError(f"{q['id']}: " + "; ".join(problems))
    return q


def parse_questions(path, scenario_id):
    lines = path.read_text().splitlines()
    questions, current, header, body = [], None, None, []
    for line in lines + ["### **Question 999**"]:
        m = QUESTION_RE.match(line.strip())
        if m:
            if current is not None:
                questions.append(parse_question(current, header, body, scenario_id))
            current, header, body = int(m.group(1)), m.group(2), []
        elif current is not None:
            body.append(line)
    return questions


def main():
    scenarios = parse_scenarios()
    questions = []
    for path in sorted(SRC.glob("mock-qa-scenario-*.md"), key=lambda p: int(re.search(r"(\d+)", p.stem).group(1))):
        sid = int(re.search(r"(\d+)", path.stem).group(1))
        qs = parse_questions(path, sid)
        for q in qs:
            if not q["domains"]:
                q["domains"] = scenarios[sid]["domains"]
        questions.extend(qs)

    data = {"scenarios": [scenarios[k] for k in sorted(scenarios)], "questions": questions}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "// Generated by scripts/build_mock_exam.py from mock-exam/*.md. Do not edit by hand.\n"
        "window.EXAM_DATA = " + json.dumps(data, indent=1, ensure_ascii=False) + ";\n"
    )
    per_domain = {}
    for q in questions:
        for d in q["domains"]:
            per_domain[d] = per_domain.get(d, 0) + 1
    print(f"Wrote {OUT.relative_to(ROOT)}: {len(scenarios)} scenarios, {len(questions)} questions")
    print("Questions per domain:", dict(sorted(per_domain.items())))


if __name__ == "__main__":
    try:
        main()
    except ValueError as e:
        sys.exit(f"Parse error: {e}")
