# Prompt: generate questions to balance the domain weights

A full scenario (brief + 5 questions) is ~10k characters, so generate **one scenario per message**. Copy everything below the line, change the `RUN` line (11 → 20), and send it. The prompt is under 7,000 characters.

---

RUN: Scenario 11

You write practice questions for the Google Cloud Professional Agentic Architect exam. Ground every technical claim in the retrieved documentation. Never invent flags, limits, class names, or products; if a detail is not supported, build the question on something that is.

Context: an existing bank (Scenarios 1–10) over-covers Domains 4 and 5. Scenarios 11–20 rebalance it. Generate ONLY the scenario named in RUN, using its row below.

Domains: D1 Low-code (Agent Designer, CX Agent Studio/Dialogflow CX, Agent Search). D2 Coding agents (agents-cli, MCP, Agent Skills, Data Agent Kit). D3 Custom ADK agents (orchestration, state, memory, RAG, identity, A2A). D4 Evaluate, deploy, observe. D5 Security & governance.

| # | Focus | Q1–Q5 domain | Q1–Q5 correct letter | One topic per question, in order |
|-|-|-|-|-|
| 11 | Agent Designer low-code agent | 1,1,1,1,1 | A,D,B,A,C | system instructions (persona/scope/format); few-shot to fix output format; chain-of-thought for multi-step task; dynamic templating `{session.params.x}`; low-code vs ADK choice |
| 12 | Dialogflow CX flows + multimodal data | 1,1,1,1,1 | D,A,C,B,A | flows split across teams; intent vs condition route; event handlers (no-match/no-input/webhook error); multimodal ingestion (images, scanned PDFs, call audio); extracting structured fields |
| 13 | Team adopting agents-cli | 2,2,2,2,2 | B,A,D,C,A | `uvx google-agents-cli setup` and which injected skill fits; `create --prototype` vs full scaffold; `scaffold enhance`; `playground` vs `run`; project layout (`app/agent.py`, manifest, eval dataset) |
| 14 | Exposing systems via MCP | 2,2,2,2,2 | A,C,D,B,D | stdio vs Streamable HTTP by environment; managed remote MCP vs self-hosted MCP Toolbox on Cloud Run; Secret Manager creds for self-hosted; `tool_filter` least privilege; `to_mcp_server` |
| 15 | Agent Skills + Data Agent Kit | 2,2,2,3,3 | D,B,A,A,C | L1/L2/L3 loading; `assets/` `scripts/` `references/`; DAK for BigQuery/dbt in IDE; `SkillToolset` in ADK; `AgentTool` model tiering vs MCP context bloat |
| 16 | Dynamic ADK orchestration | 3,3,3,3,3 | C,A,D,B,A | LLM delegation and sub-agent `description`; `AgentTool` vs transfer; `RoutedAgent` A/B or fallback; custom `BaseAgent` `_run_async_impl`; graph workflows (ADK 2.0+) vs templates |
| 17 | Assistant with state + long-term memory | 3,3,3,3,3 | B,D,A,C,D | `app:` or no-prefix state choice (not temp vs user); Memory Bank vs RAG memory service; `add_session_to_memory` vs `add_events_to_memory` vs `add_memory`; TTL/revisions/identity isolation; production session backend |
| 18 | Agents calling SaaS on user's behalf | 3,3,3,3,5 | A,B,D,C,B | Auth Manager 3-legged OAuth vs API key; Agent Registry for agents/MCP/skills; `A2AServer`/`RemoteA2aAgent` + agent cards; streaming/long-running A2A tasks; HITL confirmation via callback/policy engine before risky action |
| 19 | RAG over a large corpus | 3,3,3,4,4 | D,C,B,A,D | chunking/layout parsing; hybrid search + RRF vs pure vector; ranking API before synthesis; groundedness autorater; `eval analyze`/`compare` to find retrieval regression |
| 20 | Production on GKE / Agent Runtime | 4,4,4,4,4 | B,A,C,D,B | GKE vs Agent Runtime vs Cloud Run for a new constraint; PSC interface vs Direct VPC egress; BigQuery Agent Analytics for token cost; `eval optimize` (GEPA); release metrics (business, telemetry, feedback) |

Avoid these storylines (already used): retail support, developer MCP assistant, healthcare GraphRAG, e-commerce orders, logistics A2A, summarization CI/CD, canary rollout, trace debugging, PAB, Agent Gateway/Model Armor. Pick a fresh industry.

Quality rules:
1. Each question opens with a 3–5 sentence situation (company, what they built, the problem, 1–2 constraints such as no developers, CMEK, least privilege, latency, deadline), then a bold one-line prompt like `**What should you do?**`.
2. All four options are plausible: real features misapplied, a correct idea that breaks one stated constraint, or a workable path with more custom code than needed. A stem detail must decide between at least two viable options.
3. No giveaways: options of similar length; the correct one is not the longest and does not echo stem keywords; no "always/never/all of the above".
4. Use the exact correct letters from the table.
5. Explanations are concise, 1–2 sentences each; every distractor names the specific reason it fails.
6. Short code snippets (ADK Python, CLI commands) only when documented.
7. Keep the whole reply under 9,000 characters.
8. No bold, no parenthetical feature names, no LaTeX inside options. Plain text only.

Distractor test: a candidate who knows Google Cloud only superficially must find at least three options tempting. REJECTED examples from a previous run (never write options like these):
- "Increase temperature to 2.0 to force deterministic JSON" (factually absurd)
- "Build a custom C++ app with gRPC and manual vector math" (nobody would pick it)
- "Use Agent Gateway to convert text into JSON" (product used for an unrelated job)
- A correct option that is twice as long and names the technique in bold.
GOOD distractor patterns: lower temperature to 0 to fix a schema problem (sounds right, does not teach the schema); add few-shot examples when the real issue is reasoning; a code-first solution that would work but breaks a "no developers" constraint; a real product meant for another audience (e.g., Gemini Enterprise for employees vs a public customer chat). Before finishing, re-read each question and fix any option that fails this test.

Output exactly this Markdown (a parser reads it). One domain per question header. No HTML, no tables.

```
===== BRIEF =====
### **Scenario N: <Title>**
* **Context/Setup:** <2–3 sentences>
* **Goal:** <1 sentence>
* **Constraints:**
  * <constraint>
  * <constraint>
  * <constraint>
* **Primary Exam Domains:** **Domain X** (<topics>).
===== QUESTIONS =====
Five scenario-based questions for **Scenario N (<Title>)**.

---

### **Question 1 (Domain X - <Short Topic>)**

<situation>

**What should you do?**

* **A.** <option>
* **B.** <option>
* **C.** <option>
* **D.** <option>

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** <text>
  * **Why Distractor B fails:** <text>
  * **Why Distractor C fails:** <text>
  * **Why Distractor D fails:** <text>

---

### **Question 2 (Domain X - <Short Topic>)**
...
```

List only the domains used by this scenario's questions in its Primary Exam Domains line. Include exactly three "Why Distractor" lines per question, one for each wrong letter.

The BRIEF must contain all five bullets exactly as shown (Context/Setup, Goal, Constraints with 3 sub-bullets, Primary Exam Domains). Question stems are a plain paragraph: do not use Context:/Goal:/Constraints: labels inside questions. Do not add a closing remark or a "next step" suggestion.
