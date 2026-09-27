Five scenario-based questions for **Scenario 8 (Enterprise Observability & Non-Deterministic Reasoning Debugging)**.

---

### **Question 1 (Domain 4 - Distributed Tracing Across Services)**

A SaaS company's ADK agent sometimes takes more than 30 seconds to answer. The agent calls an MCP server on Cloud Run, which queries AlloyDB. Current logs show only each request's total duration. Engineers need to see, for a single slow request, how long each model call took, how long each tool call took, and whether a slow tool call was spent in the MCP server's database queries or somewhere else.

**What should you do?**

* **A.** Enable OpenTelemetry tracing in the agent with the Cloud Trace exporter, so that each turn, model call and tool call is recorded as a nested span in one trace.
* **B.** Add structured JSON log entries with timing fields at the start and end of each model and tool call in the agent and the MCP server, and build log-based latency metrics.
* **C.** Enable OpenTelemetry tracing with the Cloud Trace exporter in both the agent and the MCP server, and propagate the trace context in the headers of the agent's MCP requests.
* **D.** Enable Cloud Profiler on the agent and the MCP server, and compare CPU and wall-time profiles of slow periods with profiles of normal periods to find the bottleneck.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Nested OTel spans show where time goes within a turn. Propagating trace context to the MCP server extends the same trace into the server, so its database spans appear under the agent's tool span.
  * **Why Distractor A fails:** It shows each tool call's total duration from the agent's side, but not what happened inside the MCP server, which the engineers explicitly need.
  * **Why Distractor B fails:** Separate log entries have no parent-child relationship, so reconstructing the path of one request across services is manual and unreliable.
  * **Why Distractor D fails:** Profiles aggregate CPU and wall time across many requests. They do not show the sequence of calls within one specific slow request.

---

### **Question 2 (Domain 4 - Token Cost Analytics)**

The finance team wants to calculate cost per session and per agent, and track token-usage trends over the past 13 months, using SQL. The platform team does not want to change any tool code. The agents already send traces to Cloud Trace.

**What should you do?**

* **A.** Enable ADK's BigQuery Agent Analytics plugin, so that agent events, including model token counts and session IDs, are streamed into BigQuery tables for SQL analysis.
* **B.** Query token counts from the span attributes in Cloud Trace, and give the finance team access to the Trace explorer to filter and aggregate spans by session and agent.
* **C.** Record token counts as Cloud Monitoring custom metrics labeled with session ID and agent name, and build dashboards that show cost per session and per agent.
* **D.** Add a step to each tool that inserts the current model's token counts, the session ID and the agent name into a Cloud SQL table after the tool finishes running.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The plugin streams agent telemetry into BigQuery without changing tool code. BigQuery supports long retention and ad hoc SQL, which is what finance needs.
  * **Why Distractor B fails:** Cloud Trace keeps data for about 30 days and is not a SQL analytics tool, so 13-month trends are impossible.
  * **Why Distractor C fails:** Session ID labels create very high-cardinality metrics, and Monitoring does not support ad hoc SQL analysis.
  * **Why Distractor D fails:** It requires changing every tool and records token counts in the wrong place, because model calls happen outside tools.

---

### **Question 3 (Domain 4 - Diagnosing a Tool Cascade)**

Users sometimes wait about 45 seconds and then receive "I encountered an issue processing your request." Cloud Trace shows that during those turns, a single `LlmAgent` called `search_knowledge_base` 20 times with nearly identical arguments. Each call returned an empty list. The agent is not part of any workflow agent.

**What should you do?**

* **A.** Wrap the agent in a `LoopAgent` with `max_iterations=3`, so that the agent's reasoning loop stops after three attempts and returns whatever it has found by then.
* **B.** Increase the timeout of the `search_knowledge_base` tool, so that slow searches can complete and return results instead of returning an empty list to the model.
* **C.** Set the model's temperature to 0 so that its behavior is deterministic, which prevents it from exploring many slightly different variations of the same search.
* **D.** Change the tool to return an explicit "no results found" message that suggests a next step, and cap model calls per invocation with `max_llm_calls` in `RunConfig`.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** The model keeps retrying because an empty list gives it no guidance, which is a tool cascade. A clear result message breaks the pattern, and `max_llm_calls` caps any cascade that still happens.
  * **Why Distractor A fails:** `LoopAgent` repeats its sub-agents' entire runs. It does not limit the tool calls the model makes within one run, and it could repeat the whole cascade three times.
  * **Why Distractor B fails:** The calls returned quickly with empty results; they did not time out, so a longer timeout changes nothing.
  * **Why Distractor C fails:** A deterministic model repeats the same unproductive choice, often with identical arguments, so the cascade continues.

---

### **Question 4 (Domain 4 & Domain 5 - Sensitive Data in Telemetry)**

A security review finds that Cloud Trace spans from the support agent contain the full text of prompts and model responses, including customers' names, addresses and account details. Engineers still need traces that show span timing, errors, tool names and token counts to debug production issues. Only a few engineers should ever see conversation content.

**What should you do?**

* **A.** Restrict the Cloud Trace User role to a small group of senior engineers, and leave the tracing configuration unchanged so that no diagnostic detail is lost.
* **B.** Configure the agent's tracing to stop recording prompt and response content in span attributes, while keeping timing, status, tool names and token counts.
* **C.** Disable tracing in production, and reproduce customer issues in staging, where the prompts come from test data that contains no personal information.
* **D.** Apply a Model Armor output template with Sensitive Data Protection de-identification to model responses, so that personal information is masked before it is recorded.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Content capture is a separate choice from span recording. Turning it off removes customer data from traces while keeping everything engineers need for debugging. The few people allowed to see conversation content can use a separately controlled store.
  * **Why Distractor A fails:** The personal data is still collected and stored in traces. Limiting who can view it does not address the finding that it is stored there at all.
  * **Why Distractor C fails:** Many production issues cannot be reproduced in staging, so engineers lose their main debugging tool.
  * **Why Distractor D fails:** It masks model outputs only. Customers' own prompts, which contain the same details, are still recorded in full.

---

### **Question 5 (Domain 4 - Silent Tool Failures)**

A banking agent told a customer, "Your transfer of $500 is complete," but no money moved. The trace shows the `execute_transfer` span with status OK. Its code shows that the tool catches every exception from the payments API and returns the string "Transfer submitted." In this case, the payments API had returned HTTP 500.

**What should you do?**

* **A.** Add to the agent's instruction: "Never tell the customer a transfer is complete unless the tool explicitly confirms that the transfer succeeded," and add this case to the evaluation dataset.
* **B.** Create a Cloud Monitoring alert on HTTP 500 responses from the payments API, so that the operations team can contact affected customers soon after a failure occurs.
* **C.** Make the tool return a structured error with the failure reason when the payments API fails, and record the exception on the tool's span with an error status.
* **D.** Make the tool retry the payments API up to three times when it fails, and return "Transfer submitted" only after one of the attempts has succeeded.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** The tool hides the failure from both the model and the traces. Returning a structured error lets the model tell the customer the truth, and setting the span's error status makes these failures visible and possible to alert on.
  * **Why Distractor A fails:** The tool returns "Transfer submitted", which reads as success, so the model follows its instruction and still reports success.
  * **Why Distractor B fails:** It detects the problem after the customer has already been told something false, and the tool's traces still show success.
  * **Why Distractor D fails:** Retrying a payment that is not idempotent can move money twice, and when all attempts fail, the failure still needs to be reported correctly.
