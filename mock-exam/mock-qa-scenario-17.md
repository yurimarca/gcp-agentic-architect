Five scenario-based questions for **Scenario 17 (Private Banking Assistant with State and Long-Term Memory)**.

---

### **Question 1 (Domain 3 - Choosing State Scopes)**

A private banking assistant built with ADK needs two new state values. `market_open` is updated by a scheduled job and must be read by every client session. `portfolio_id` records which portfolio the client is discussing in the current conversation. Clients often switch portfolios between conversations, so `portfolio_id` must not carry over into the next conversation, but it must survive across turns within one conversation.

**Which keys should you use?**

* **A.** `user:market_open` and `portfolio_id`
* **B.** `app:market_open` and `portfolio_id`
* **C.** `app:market_open` and `user:portfolio_id`
* **D.** `app:market_open` and `temp:portfolio_id`

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** The `app:` prefix is shared across all users and sessions, which fits a global flag written once by a job. A key with no prefix is session-scoped: it persists across turns and ends with the conversation.
  * **Why Distractor A fails:** `user:` is scoped to each user, so the job would have to write the flag for every client separately.
  * **Why Distractor C fails:** `user:` persists across all of a client's sessions, so the previous portfolio would carry into the next conversation.
  * **Why Distractor D fails:** `temp:` is discarded at the end of each turn, so the portfolio would be forgotten after every response.

---

### **Question 2 (Domain 3 - Memory Bank vs. RAG Memory)**

The assistant should remember clients' goals, risk tolerance, and life events across years of conversations, which amounts to hundreds of facts per client. The prototype uses `VertexAiRagMemoryService` over raw transcripts. A client who moved from a conservative to an aggressive risk profile last month is still described as conservative, because older transcript chunks are retrieved alongside the new one.

**What should you do?**

* **A.** Keep the RAG memory service, add dates to the stored chunks, and instruct the model to trust the most recent chunk when retrieved chunks conflict.
* **B.** Store the profile in `user:` state keys that the model updates on each turn, and include all of them in the prompt for every session.
* **C.** Increase the number of transcript chunks retrieved from RAG memory, so that the model sees the full history before it answers.
* **D.** Switch to `VertexAiMemoryBankService`, which extracts facts from sessions and consolidates them, updating existing memories when facts change.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Memory Bank extracts facts and consolidates them over time, so a new risk profile updates the existing memory instead of sitting next to a contradictory old transcript. It also supports similarity search over hundreds of facts.
  * **Why Distractor A fails:** Conflict resolution still depends on the model's judgment at every answer, and the store keeps growing with stale, contradictory text.
  * **Why Distractor B fails:** Hundreds of free-form facts in prompt state do not scale and cannot be searched, and model-written updates on every turn are unreliable.
  * **Why Distractor C fails:** More raw history brings in more contradictions and more tokens.

---

### **Question 3 (Domain 3 - Memory Ingestion Methods)**

Compliance requires that a conversation be added to long-term memory only after it ends and the client has confirmed the closing summary. A developer currently has the agent write a short summary and store it with `add_memory`, but the summaries leave out facts that clients mentioned mid-conversation. Another developer proposes calling `add_events_to_memory` after every turn.

**What should you do?**

* **A.** When the confirmed session ends, call `add_session_to_memory` with the completed session so that the whole conversation is processed.
* **B.** Call `add_events_to_memory` after every turn with that turn's events, so that no fact is missed as the conversation goes on.
* **C.** Keep using `add_memory` but instruct the agent to write a longer and more detailed summary before the session closes.
* **D.** Call `search_memory` with the full transcript when the session ends, so that Memory Bank indexes the conversation.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** `add_session_to_memory` ingests the complete session, so fact extraction sees every turn. Calling it once the confirmed session ends meets the compliance rule.
  * **Why Distractor B fails:** Ingesting after each turn adds content before the client has confirmed the summary, which breaks the compliance requirement.
  * **Why Distractor C fails:** A model-written summary is still lossy. Direct fact injection bypasses Memory Bank's own extraction from the full conversation.
  * **Why Distractor D fails:** `search_memory` queries stored memories. It does not add anything.

---

### **Question 4 (Domain 3 - Memory Isolation and Retention)**

The bank's compliance team sets three rules for the memory store. A client's memories must never be retrievable in another client's session. Memories must be deleted automatically after seven years. Auditors must be able to see how a memory changed over time.

**What should you do?**

* **A.** Create a separate Memory Bank instance for each client and delete each instance seven years after the client's last conversation.
* **B.** Scope memories by `user_id`, run a Cloud Scheduler job that deletes old memories, and export every change to Cloud Logging for audits.
* **C.** Scope memories by `user_id`, set a seven-year TTL on memories, and use memory revision tracking to show auditors how each memory changed.
* **D.** Store memories under `app:` state keyed by client ID, with a timestamp on each entry, and filter out entries older than seven years.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Memory Bank supports identity-isolated retrieval, TTL expiration, and revision tracking natively, which covers all three rules through configuration.
  * **Why Distractor A fails:** One instance per client is a large operational burden and still does not meet the audit requirement.
  * **Why Distractor B fails:** It rebuilds TTL and revision history with custom jobs and logs when both are built in.
  * **Why Distractor D fails:** `app:` state is shared across all users, so every session could read every client's data.

---

### **Question 5 (Domain 3 - Production Session Storage)**

The assistant runs on Cloud Run and autoscales up to 200 instances. Clients report that it forgets which portfolio they were discussing partway through a conversation. The agent uses `InMemorySessionService`, and one engineer proposes turning on Cloud Run session affinity.

**What should you do?**

* **A.** Enable Cloud Run session affinity so that each client's requests reach the same instance for the length of the conversation.
* **B.** Set the minimum number of instances equal to the maximum, so that instances are never scaled in and no session state is lost.
* **C.** Move the conversation values to `user:` prefixed keys so that they persist independently of the container that handles the request.
* **D.** Replace `InMemorySessionService` with an external session service, such as `DatabaseSessionService` on Cloud SQL or Agent Platform Sessions.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** An external session backend lets any instance load and update the session, so state survives scaling events and restarts.
  * **Why Distractor A fails:** Affinity is best-effort. Sessions are still lost when an instance is scaled in, restarted, or overloaded.
  * **Why Distractor B fails:** It is expensive and still leaves requests spread across 200 instances, each with its own separate memory.
  * **Why Distractor C fails:** The prefix changes the scope of a value, not where it is stored. The values still live in the memory of one instance.
