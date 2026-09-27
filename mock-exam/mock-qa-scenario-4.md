Five scenario-based questions for **Scenario 4 (High-Concurrency E-Commerce Order Processing)**.

---

### **Question 1 (Domain 3 - ADK Workflow Patterns)**

Your checkout flow uses an ADK root agent that calls an inventory sub-agent, a payment-validation sub-agent, and a shipping-estimate sub-agent. During last year's peak sale, p95 latency reached 9 seconds. Traces show the three sub-agents running one after another, each taking about 2.5 seconds, and none of them reads another's output. The final reply to the customer must combine all three results. You want to reduce latency with as little custom code as possible.

**What should you do?**

* **A.** Keep the root `LlmAgent` and list the three agents in its `sub_agents`, so that the model can transfer control to each agent as needed and then combine the results.
* **B.** Put the three sub-agents in a `ParallelAgent`, and make it the first step of a `SequentialAgent` whose second step is a summary agent that reads each sub-agent's `output_key`.
* **C.** Wrap each sub-agent in an `AgentTool` on the root agent, and rely on the model issuing the three tool calls in a single parallel function-calling turn.
* **D.** Put all three sub-agents and the summary agent in a single `ParallelAgent`, so that all four agents start at the same time and the overall latency is as low as possible.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** `ParallelAgent` runs the independent sub-agents concurrently, which cuts latency from about 7.5 seconds to about 2.5 seconds. Wrapping it in a `SequentialAgent` guarantees that the summary agent runs only after all three results are in state. This is the standard fan-out/gather pattern and needs no custom code.
  * **Why Distractor A fails:** LLM-driven transfer hands control to one sub-agent at a time, so the work still runs one step after another, and the order depends on the model.
  * **Why Distractor C fails:** The calls might run in parallel, but only if the model chooses to issue them together. The latency improvement is not guaranteed.
  * **Why Distractor D fails:** The summary agent would start before the other three have produced their results, so it has nothing to combine.

---

### **Question 2 (Domain 3 - State Namespaces)**

Your checkout agent handles three pieces of data. First, the payment agent creates a signed verification nonce that a later tool call in the same turn needs; compliance says the nonce must not be retrievable afterwards. Second, the customer's loyalty tier takes 400 ms to fetch from the CRM, changes rarely, and should be available in all of that customer's future sessions. Third, a `checkout_step` value tracks progress through the current checkout conversation across several turns.

**Which state key prefixes should you use?**

* **A.** `nonce` with no prefix, `user:loyalty_tier`, and `temp:checkout_step`.
* **B.** `temp:nonce`, `app:loyalty_tier`, and `checkout_step` with no prefix.
* **C.** `temp:nonce`, `user:loyalty_tier`, and `checkout_step` with no prefix.
* **D.** `temp:nonce`, `user:loyalty_tier`, and `user:checkout_step`.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** `temp:` data lasts only for the current invocation, so the nonce is available to the later tool call and then discarded. `user:` data persists across all sessions for the same user, which suits the loyalty tier. Unprefixed keys are session-scoped, which suits progress within one checkout conversation.
  * **Why Distractor A fails:** The unprefixed nonce stays in session state for the rest of the session, which breaks the compliance rule. `temp:checkout_step` is discarded after every turn, so progress is lost.
  * **Why Distractor B fails:** `app:` is shared by all users, so one customer's loyalty tier would overwrite everyone else's.
  * **Why Distractor D fails:** `user:checkout_step` carries over into the customer's next, unrelated checkout, which then starts partway through.

---

### **Question 3 (Domain 3 - Aggregating Parallel Results)**

Your pipeline is a `SequentialAgent` that runs a `ParallelAgent` (inventory, payment and shipping sub-agents) and then an `OrderSummaryAgent`. Sometimes the summary says "shipping quote unavailable", even though the logs show the shipping agent produced a quote. All three sub-agents are configured with `output_key="result"`, and the summary agent's instruction references `{result}`.

**What should you do?**

* **A.** Give each sub-agent its own `output_key`, and reference the three keys, such as `{shipping_quote}`, in the summary agent's instruction.
* **B.** Replace the `ParallelAgent` with a `SequentialAgent`, so that the three sub-agents write to `result` one at a time and the summary reads a predictable value.
* **C.** Change the shared key to `temp:result`, so that the value is kept only for the current invocation and is not carried over into the next turn.
* **D.** Remove `{result}` from the summary agent's instruction and tell it to read the three sub-agents' messages from the conversation history instead.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** All three sub-agents share the same session state, so writing to the same key means whichever finishes last overwrites the others. Distinct keys keep all three results, and the summary agent reads each one with `{key}` templating.
  * **Why Distractor B fails:** Running them in sequence still leaves only the last writer's value in `result`, and it gives up the latency gain the parallel design was built for.
  * **Why Distractor C fails:** The prefix changes how long the key lasts, not the fact that three agents write to the same key, so values are still overwritten.
  * **Why Distractor D fails:** It makes the summary depend on the model finding and interpreting the right messages, which is not deterministic. Explicit state keys are the reliable handoff.

---

### **Question 4 (Domain 3 - Loop Workflows)**

An ADK `LoopAgent` retries inventory reservations against supplier APIs that sometimes return rate-limit errors. During a supplier outage last week, the loop ran for 20 minutes before an engineer stopped it. Logs also show that when a supplier returns `ITEM_OUT_OF_STOCK`, the loop keeps retrying even though the result will never change.

**What should you do?**

* **A.** Set `max_iterations` on the `LoopAgent`, so that the loop stops after a fixed number of attempts, including when the item is out of stock.
* **B.** Replace the `LoopAgent` with an `LlmAgent` whose instruction tells it to retry the reservation tool up to three times and to stop immediately if the item is out of stock.
* **C.** Have the reservation tool raise a Python exception when it receives `ITEM_OUT_OF_STOCK`, so that the loop ends, and rely on the supplier's rate limits to slow down retries.
* **D.** Set `max_iterations` on the `LoopAgent`, and have the reservation sub-agent return `EventActions(escalate=True)` when it receives a non-retryable error such as `ITEM_OUT_OF_STOCK`.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** `max_iterations` is a hard cap that prevents runaway loops during outages. Escalation lets a sub-agent end the loop as soon as it sees an error that retrying cannot fix. Together they cover both failure modes.
  * **Why Distractor A fails:** The cap fixes the outage case, but out-of-stock requests still use up every retry before stopping.
  * **Why Distractor B fails:** The retry limit and exit condition now depend on the model following instructions, which is not deterministic.
  * **Why Distractor C fails:** An unhandled exception ends the whole invocation with an error instead of exiting the loop cleanly, and it does nothing to cap retries during outages.

---

### **Question 5 (Domain 3 & Domain 4 - Session Persistence on Cloud Run)**

The order agent runs on Cloud Run and uses `InMemorySessionService`. During a flash sale with about 50,000 concurrent sessions, customers reported that the agent "forgot" their cart partway through checkout. This happened most often while Cloud Run was scaling. A teammate proposes enabling session affinity on the service.

**What should you do?**

* **A.** Enable session affinity on the Cloud Run service, so that each customer's requests are routed to the instance that already holds their session in memory.
* **B.** Set the minimum and maximum number of instances to the same value, so that Cloud Run never scales down and no instance holding sessions is removed.
* **C.** Replace `InMemorySessionService` with `DatabaseSessionService` backed by Cloud SQL or AlloyDB, so that whichever instance receives a turn can load and update that customer's session.
* **D.** Mount a Cloud Storage bucket with Cloud Storage FUSE, and write a snapshot of each in-memory session to a file after every turn so it can be reloaded later.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Externalizing sessions to a shared, durable store means any instance can serve any turn, and nothing is lost when instances start or stop. This is how ADK is meant to run on horizontally scaling platforms.
  * **Why Distractor A fails:** Cloud Run session affinity is best effort. When an instance is shut down or overloaded, requests move to another instance, and in-memory sessions are lost.
  * **Why Distractor B fails:** Requests are still spread across many instances that do not share memory, instances still restart, and the fixed size removes the elasticity needed for a flash sale.
  * **Why Distractor D fails:** File snapshots on FUSE have no concurrency control, so parallel requests can overwrite each other, and it reimplements a session store badly.
