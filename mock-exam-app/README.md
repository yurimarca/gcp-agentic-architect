# Agentic Architect Mock Exam

A scenario-based mock exam for the **Google Cloud Professional Agentic Architect** certification, deployed on **Firebase Hosting + Cloud Firestore + Anonymous Authentication**. It uses the same setup as [`agy-game`](../agy-game/README.md).

- **50 questions** from **10 case studies**, covering all 5 exam domains.
- **A diagram for every case study.** It shows the setup and constraints. The design decision each question asks about is marked with an amber **?**, so the diagram never gives away an answer.
- **Answer options are shuffled every attempt.** Each explanation stays attached to its option.
- **Five modes:**

  | Mode | Questions | Timer | Feedback |
  | --- | --- | --- | --- |
  | Full mock exam | 50 | 120 min | After submit; score can go on the leaderboard |
  | Quick exam | 20 random | 45 min | After submit |
  | Case study drill | 5 | — | After each answer, with a streak counter |
  | Domain drill | All questions for one domain | — | After each answer |
  | Review mistakes | Questions you last got wrong | — | After each answer |

- **Results screen:** score, breakdown by domain and by case study, and a review of every question with an explanation for each option.
- **Saved on this device (`localStorage`):** unfinished sessions (with a Resume option), attempt history, per-case-study progress and your mistakes.

## Project structure

```
mock-exam/                      ← source of truth (markdown)
├── exam-format.md              ← exam guide / domain notes
├── exam-mock-scenarios.md      ← the 10 case-study briefs
└── mock-qa-scenario-{1..10}.md ← 5 questions per case study
scripts/build_mock_exam.py      ← markdown → public/questions.js
mock-exam-app/
├── firebase.json               ← hosting target "mock-exam", emulator ports
├── .firebaserc                 ← project agy-sandbox-4a603, target → site "agy-mock-exam"
├── firestore.rules             ← PROJECT-WIDE rules (identical to agy-game/firestore.rules)
└── public/
    ├── index.html
    ├── style.css               ← light/dark theme tokens, diagram styles
    ├── questions.js            ← GENERATED question bank (window.EXAM_DATA)
    ├── diagrams.js             ← inline-SVG case-study diagrams
    ├── leaderboard.js          ← Firestore + anonymous auth (exam_scores)
    └── app.js                  ← exam engine, UI, results
```

## Editing questions

Edit the markdown in `mock-exam/`, then regenerate:

```bash
python3 scripts/build_mock_exam.py
```

The parser checks that every question has options A–D, a correct answer, a prompt, a context and one explanation per option. If anything is missing it stops with an error naming the question, for example `s3q2: missing explanation for ['C']`. Keep the existing markdown layout: `### **Question N (Domain X - Topic)**`, a one-paragraph scenario, a bold question line, `* **A.** …` options, then `#### **Answer & Explanation**` with `Correct Answer:`, `Why it's correct:` and `Why Distractor X fails:`. The topic in the heading is shown only after the question is answered.

Questions are written in the style of the real exam. Requirements are stated as business facts inside the scenario, not as a Goal/Constraints list, and are never phrased with the words of the correct option. Every option should be something a competent engineer might choose, and options should be similar in length and detail. (The parser still accepts optional `**Context:**`, `**Goal:**` and `**Constraints:**` labels.)

Diagrams are hand-laid-out SVG in `public/diagrams.js`, one function per scenario id. A new scenario still works without a diagram; it just won't have a picture.

## Firebase setup

This app is a **second Hosting site** in the same Firebase project as `agy-game` (`agy-sandbox-4a603`), so both apps stay online.

1. Create the Hosting site (one time):
   ```bash
   cd mock-exam-app
   ../agy-game/firebase hosting:sites:create agy-mock-exam
   ```
   If that site ID is taken, choose another one and update it in `.firebaserc` (`targets → hosting → mock-exam`).
2. Anonymous Authentication is already enabled for `agy-game`, so there is nothing to do here.

### Firestore rules are project-wide

A Firebase project has **one** Firestore ruleset. Whichever folder you deploy rules from replaces the rules for **both** apps. So `mock-exam-app/firestore.rules` and `agy-game/firestore.rules` are kept **identical**: each contains the `scores` rules (game) and the `exam_scores` rules (exam). If you change one, copy it to the other.

`exam_scores` accepts only well-formed documents from anonymous users:
- `name` must match `^[A-Za-z0-9_-]{3,12}$`
- `total == 50` and `0 ≤ correct ≤ 50`
- `scorePct == correct * 2`
- `60 ≤ durationSec ≤ 7200`
- `uid == request.auth.uid` and `timestamp == request.time`

Rules alone can't stop a determined cheater, since answers ship to the browser. Treat the leaderboard as a friendly scoreboard.

## Run locally

```bash
cd mock-exam-app
../agy-game/firebase emulators:start --only hosting,firestore
# open http://127.0.0.1:5002
```

On `localhost`/`127.0.0.1`, `leaderboard.js` points Firestore at the emulator (port 8080), so local tests never write to production. Anonymous sign-in still uses the real Auth service, which is the same as `agy-game`.

If you open `public/index.html` directly from disk, everything works except the leaderboard, which shows as offline.

## Deploy

```bash
cd mock-exam-app
python3 ../scripts/build_mock_exam.py                          # refresh questions.js
../agy-game/firebase deploy --only firestore:rules,hosting:mock-exam
```

The app is served at `https://agy-mock-exam.web.app` (or whatever site ID you chose).

## Keyboard shortcuts

`1`–`4` or `A`–`D` select an option · `Enter` check / next · `←` `→` previous / next · `F` flag · `Esc` close the navigator.
