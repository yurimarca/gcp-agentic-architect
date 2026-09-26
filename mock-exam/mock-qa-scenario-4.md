Here are **5 realistic, scenario-based multiple-choice exam questions** built directly on **Scenario 4 (High-Concurrency E-Commerce Order Processing)**, focusing on ADK multi-agent workflow patterns, state namespaces, output aggregation, and session persistence.

---

### **Question 1 (Domain 3 - ADK Workflow Patterns & Parallel Execution)**

**Context:** An e-commerce platform uses the Agent Development Kit (ADK) to build an order-processing orchestrator. When a customer submits an order, the root agent must invoke three sub-agents: `InventoryAgent`, `PaymentValidationAgent`, and `ShippingEstimationAgent`. None of these three sub-agents depend on the outputs or state of the others.

**Goal:** Configure the ADK workflow to minimize end-to-end execution latency during high-volume sales events.

**Constraints:**
* Sub-agents must execute **concurrently** in parallel rather than sequentially.
* Must use built-in ADK workflow classes without writing manual custom Python `asyncio` boilerplate.

**Which ADK workflow class should you use to orchestrate these sub-agents?**

* **A.** `ParallelAgent`
* **B.** `SequentialAgent`
* **C.** `LoopAgent`
* **D.** `RoutedAgent`

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** ADK's `ParallelAgent` workflow class executes independent sub-agents concurrently. This minimizes end-to-end latency when sub-tasks do not depend on each other's intermediate state.
  * **Why Distractor B fails:** `SequentialAgent` executes sub-agents serially one after another, multiplying overall latency by the sum of individual sub-agent execution times.
  * **Why Distractor C fails:** `LoopAgent` repeatedly executes a sequence of sub-agents in a loop until a termination condition is met; it does not execute sub-agents in parallel.
  * **Why Distractor D fails:** `RoutedAgent` evaluates a routing function to select exactly *one* target sub-agent per invocation rather than running all sub-agents concurrently.

---

### **Question 2 (Domain 3 - ADK State Namespaces & Data Lifetimes)**

**Context:** During order processing, the `PaymentValidationAgent` generates temporary transaction verification tokens and intermediate API signature hashes. Simultaneously, the system needs to fetch and remember the customer's preferred delivery instructions across all future shopping sessions.

**Goal:** Assign the appropriate ADK state namespaces for storing (1) the temporary verification tokens and (2) the customer's delivery preferences.

**Constraints:**
* Temporary verification tokens must be **discarded immediately** when the turn completes to avoid memory leaks or token exposure.
* Delivery preferences must persist **across all sessions** for that specific customer ID.

**Which state namespace configuration should you implement?**

* **A.** Store verification tokens in the `temp:` namespace (e.g., `session.state["temp:auth_token"]`) and delivery preferences in the `user:` namespace (e.g., `session.state["user:delivery_pref"]`).
* **B.** Store verification tokens in the `app:` namespace and delivery preferences in the `temp:` namespace.
* **C.** Store verification tokens in the non-prefixed session namespace and delivery preferences in the `app:` namespace.
* **D.** Store both verification tokens and delivery preferences in the non-prefixed session namespace.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** ADK enforces 4 state namespaces:
    * `temp:` variables persist strictly for the **current turn/invocation** and are discarded immediately after the turn finishes.
    * `user:` variables persist **across all sessions** for that specific `user_id`.
  * **Why Distractor B fails:** `app:` is global across all users and all sessions, exposing sensitive auth tokens to all system tenants; `temp:` would delete delivery preferences at the end of the turn.
  * **Why Distractor C fails:** Non-prefixed state persists throughout the session (not deleted after the turn); `app:` would overwrite delivery preferences globally across all customers.
  * **Why Distractor D fails:** Storing both in non-prefixed session state means tokens remain in session history for the entire session, and delivery preferences are lost when the session ends.

---

### **Question 3 (Domain 3 - State Aggregation in Parallel Workflows)**

**Context:** You have configured a `ParallelAgent` containing `InventoryAgent`, `PaymentValidationAgent`, and `ShippingEstimationAgent`. Each sub-agent writes its final calculation status into `session.state` using its configured `output_key`. A downstream `OrderSummaryAgent` in a `SequentialAgent` pipeline needs to aggregate these three distinct results into a final confirmation response to the user.

**Goal:** Configure sub-agent output writing and downstream prompt templating so the `OrderSummaryAgent` receives all three results cleanly.

**Constraints:**
* Must prevent sub-agents from overwriting each other's state variables during concurrent execution.
* Must pass aggregated values into the `OrderSummaryAgent` prompt instructions using standard ADK state templating.

**Which design pattern should you implement?**

* **A.** Assign unique `output_key` values to each sub-agent (e.g., `inventory_status`, `payment_status`, `shipping_quote`), and reference them in the downstream agent's instructions using `{inventory_status}`, `{payment_status}`, and `{shipping_quote}`.
* **B.** Have all three sub-agents write to `session.state["temp:output"]` simultaneously and rely on ADK's automatic array concatenation.
* **C.** Wrap all three sub-agents in a single `LoopAgent` with a shared `global_output` string variable.
* **D.** Store output strings as environment variables in `.env` during execution.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** In ADK parallel execution, sub-agents run concurrently over the same `InvocationContext`. To avoid race conditions and state overwrites, each sub-agent must write its output to a unique `output_key` in `session.state`. Downstream agents in a `SequentialAgent` wrapper can then access these variables directly via `{var_name}` instruction templating.
  * **Why Distractor B fails:** Writing to the same state key simultaneously creates a race condition where sub-agents overwrite each other's output unpredictably.
  * **Why Distractor C fails:** `LoopAgent` runs agents sequentially in a loop, violating the parallel execution requirement.
  * **Why Distractor D fails:** Environment variables are process-global, static, and cannot hold dynamic, request-scoped concurrent session outputs.

---

### **Question 4 (Domain 3 - Loop Workflows & Escalation Exit Conditions)**

**Context:** An e-commerce platform uses an ADK `LoopAgent` to retry inventory reservation requests against external supplier APIs when initial attempts fail due to transient network rate limits.

**Goal:** Configure the loop workflow to retry reservations while preventing runaway infinite loops if a supplier API remains down permanently.

**Constraints:**
* Must enforce a hard maximum retry iteration limit at the workflow level.
* Must allow a sub-agent to break out of the loop early if a non-retryable error (e.g., `ITEM_OUT_OF_STOCK`) occurs.

**Which configuration combination should you implement?**

* **A.** Set `max_iterations` on the `LoopAgent`, and configure the inventory sub-agent to return `EventActions(escalate=True)` when encountering a non-retryable error.
* **B.** Set `max_iterations=0` on the `LoopAgent` and raise an unhandled Python `RuntimeError` inside the sub-agent.
* **C.** Deploy a Model Armor template with `Inspect and block` mode enabled on the supplier API URL.
* **D.** Use a `ParallelAgent` with `retry_count=infinite` in the `.env` configuration file.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** `LoopAgent` in ADK supports `max_iterations` as a hard safety cap against infinite loops. Sub-agents inside a loop can trigger an early exit/escalation by returning `EventActions(escalate=True)` when encountering non-retryable fatal conditions (like `ITEM_OUT_OF_STOCK`), breaking out of the loop immediately.
  * **Why Distractor B fails:** Raising unhandled exceptions crashes the entire agent runtime container process rather than gracefully escalating or falling back in the agent workflow.
  * **Why Distractor C fails:** Model Armor filters prompt injection and PII, not API retry loop logic or backend business exception flow control.
  * **Why Distractor D fails:** `ParallelAgent` runs concurrent branches, not retries; `retry_count=infinite` is invalid syntax.

---

### **Question 5 (Domain 3 & Domain 4 - Session State Externalization for Cloud Run)**

**Context:** An e-commerce platform anticipates 50,000 concurrent user sessions during a Cyber Monday flash sale. The order-processing agent is deployed as containerized pods on Google Cloud Run. Individual Cloud Run container instances scale up and down rapidly, and requests from the same user may hit different container instances across consecutive turns.

**Goal:** Ensure short-term session state (`session.state`) and conversation history persist seamlessly without losing session state when Cloud Run instances scale down or restart.

**Constraints:**
* Must NOT store session state in in-memory local dictionaries inside the application container.
* Must use a fully managed, horizontally scalable Google Cloud session storage service supported natively by ADK.

**Which session storage architecture should you deploy?**

* **A.** Configure ADK's `DatabaseSessionService` backed by Cloud SQL for PostgreSQL / AlloyDB (or `FirestoreSessionService` / `Agent Platform Sessions`) to externalize state storage.
* **B.** Store `session.state` in local JSON files inside the `/tmp/` directory of the Cloud Run container instance.
* **C.** Pass the entire raw session history string back and forth in user browser HTTP cookies on every request.
* **D.** Store session state as system instructions in a Model Armor template.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** To support stateless, horizontally scaling container runtimes like Cloud Run, ADK externalizes short-term session state to distributed storage backends such as `DatabaseSessionService` (Cloud SQL / AlloyDB), `FirestoreSessionService`, or `Agent Platform Sessions`. This ensures any scaling container instance can load and update the active session state.
  * **Why Distractor B fails:** Local `/tmp/` files are ephemeral and local to a single container instance. When Cloud Run scales down or routes the next request to a different container, the session state is lost.
  * **Why Distractor C fails:** Browser cookies have strict size limitations (4KB) and expose internal session state to client-side tampering and security vulnerabilities.
  * **Why Distractor D fails:** Model Armor templates are security policy definitions, not data persistence stores.

