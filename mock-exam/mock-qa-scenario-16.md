Five scenario-based questions for **Scenario 16 (Media Localization with Dynamic ADK Orchestration)**.

---

### **Question 1 (Domain 3 - LLM-Driven Delegation)**

A streaming company's ADK coordinator delegates localization work to three sub-agents: `SubtitlingAgent`, `DubbingAgent`, and `ComplianceAgent`. Each sub-agent has a detailed `instruction`, but the subtitling and dubbing agents share the same `description`: "Handles localization tasks." In testing, the coordinator often sends audio dubbing requests to `SubtitlingAgent`.

**What should you do?**

* **A.** Add routing rules to the coordinator's instruction that list the keywords that should send a request to each sub-agent.
* **B.** Switch the coordinator to a larger model so that it can better infer which sub-agent fits each request.
* **C.** Rewrite each sub-agent's `description` to state specifically which tasks it handles and which it does not.
* **D.** Replace the coordinator with a `SequentialAgent` that runs all three sub-agents on every localization request.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** In LLM-driven delegation, the coordinator chooses a sub-agent based on the sub-agents' descriptions. Two identical descriptions give the model no way to tell the agents apart. Distinct, specific descriptions fix the cause.
  * **Why Distractor A fails:** Keyword rules duplicate what the descriptions should say, miss requests phrased differently, and drift out of date as the sub-agents change.
  * **Why Distractor B fails:** A larger model still sees two identical descriptions. The ambiguity is in the configuration, not in the model's ability.
  * **Why Distractor D fails:** Running every sub-agent on every request wastes work and produces unwanted outputs. It removes the choice instead of fixing it.

---

### **Question 2 (Domain 3 - AgentTool vs. Transfer)**

In the middle of building a delivery plan, the coordinator needs a validation report from `FormatValidationAgent`, which uses 10 tools. It should then keep working on the plan in the same turn. `FormatValidationAgent` is currently one of the coordinator's `sub_agents`. After the transfer, the validation agent often answers the user directly, and the coordinator never finishes the plan.

**What should you do?**

* **A.** Wrap `FormatValidationAgent` in an `AgentTool` so that the coordinator calls it, receives the report, and keeps control.
* **B.** Keep it as a sub-agent and add an instruction that tells it to transfer control back to the coordinator after it writes the report.
* **C.** Put the coordinator and the validation agent in a `SequentialAgent`, with validation always running before the coordinator starts.
* **D.** Give the 10 validation tools directly to the coordinator, so that it can run the validation itself without delegating.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** With `AgentTool`, the coordinator calls the sub-agent like a function. The sub-agent's tool calls stay in its own context, the report comes back as the tool result, and the coordinator continues its turn.
  * **Why Distractor B fails:** Transferring back depends on the model following an instruction, and the validation agent's intermediate tool events still fill the shared conversation.
  * **Why Distractor C fails:** Validation would run on every request, including ones that do not need it, and always at the start instead of at the point in the plan where it is needed.
  * **Why Distractor D fails:** Ten more tool schemas and their outputs bloat the coordinator's context, which is the opposite of isolating the validation work.

---

### **Question 3 (Domain 3 - Deterministic Routing)**

The company wants to A/B test `SubtitleAgentV2` on 10% of sessions against the stable `SubtitleAgentV1`. Sessions for enterprise studios (`studio_tier == "enterprise"` in state) must always go to a dedicated high-capacity agent. If V2 fails before producing output, the request must fall back to V1. Routing must be deterministic and auditable, without an LLM call.

**What should you do?**

* **A.** Use a coordinator `LlmAgent` with descriptions for each version and an instruction to send about one in ten requests to V2.
* **B.** Run V1 and V2 in a `ParallelAgent` for every request and keep whichever response a grading step scores higher.
* **C.** Write a custom `BaseAgent` whose `_run_async_impl` picks the target agent, and add retry logic that catches V2 failures.
* **D.** Use a `RoutedAgent` whose routing function checks the studio tier and a session hash for the 10% split, with V1 as the fallback.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** A routed agent runs a routing function in code to choose exactly one sub-agent per invocation, and it supports automatic fallback when the chosen agent fails before producing output. That makes routing deterministic, testable, and free of an LLM call.
  * **Why Distractor A fails:** A model cannot reliably follow a traffic percentage, and LLM-based routing is neither deterministic nor free.
  * **Why Distractor B fails:** Running both versions doubles cost on every request, and it is not an A/B test, because every user gets whichever output scores higher.
  * **Why Distractor C fails:** It would work, but it rebuilds routing and fallback behavior that `RoutedAgent` already provides.

---

### **Question 4 (Domain 3 - Custom Non-LLM Agents)**

A `SequentialAgent` pipeline includes a step that computes file checksums and validates codec parameters with a Python library. Later steps read the results from session state. The step is currently an `LlmAgent` with a checksum tool, and the model sometimes skips the tool call or reformats the hash values. The step should not need a model at all.

**What should you do?**

* **A.** Keep the `LlmAgent`, force the tool call through its tool configuration, and set the temperature to 0 to stop the reformatting.
* **B.** Subclass `BaseAgent`, override `_run_async_impl` to run the library code, and write the results to session state through its events.
* **C.** Move the checksum code into a `before_agent_callback` on the next LLM step, so that it runs just before that step starts.
* **D.** Wrap the step in a `LoopAgent` that re-runs it until the hash format passes validation, with `max_iterations` set to 3.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** A custom agent derived from `BaseAgent` runs plain Python logic within the ADK agent interface. It fits into the `SequentialAgent` like any other step, is deterministic, and costs no model calls.
  * **Why Distractor A fails:** It still pays for a model call on a task that needs none, and the model can still change the output it passes on.
  * **Why Distractor C fails:** It hides a pipeline step inside another agent's callback, which makes the step harder to trace, test, and reuse, and ties it to the next step.
  * **Why Distractor D fails:** Retrying a non-deterministic step adds cost and latency without making the result reliable.

---

### **Question 5 (Domain 3 - Graph Workflows)**

The post-production pipeline is growing. A QA agent can send an asset back to dubbing or to subtitling depending on the issue it finds, rework can repeat up to three times before escalating to a human, and compliance checks are skipped for internal previews. The team has nested `SequentialAgent`, `LoopAgent`, and custom agents four levels deep, and nobody can follow the control flow anymore. The team uses ADK 2.0.

**What should you do?**

* **A.** Model the pipeline as a graph workflow, with a node for each agent and conditional edges for rework paths, escalation, and skipping compliance.
* **B.** Keep the template agents and add a dedicated `LoopAgent` for each rework path, so that each loop is isolated in its own branch.
* **C.** Replace the pipeline with a single coordinator `LlmAgent` that decides the next step after each agent finishes its work.
* **D.** Replace the nested structure with one custom `BaseAgent` whose `_run_async_impl` implements all the branching with if/else logic.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** In ADK 2.0 and later, graph-based workflows replace template workflows for complex branching. Conditional edges and cycles express rework loops and skips directly, so the control flow is readable and deterministic.
  * **Why Distractor B fails:** More nesting makes the problem worse. The control flow becomes even harder to follow and change.
  * **Why Distractor C fails:** A production pipeline with fixed business rules should not depend on a model deciding the next step each time.
  * **Why Distractor D fails:** It would work, but it hides the whole topology in custom code that is hard to visualize and test, which is the problem graph workflows solve.
