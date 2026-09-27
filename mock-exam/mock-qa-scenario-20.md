Five scenario-based questions for **Scenario 20 (FinTech Settlement Agents in Production)**.

---

### **Question 1 (Domain 4 - Selecting a Deployment Target)**

A payments company is deploying a fraud-scoring agent. It must run inference on an accelerator type that the serverless platforms do not offer, include a sidecar container that connects to a legacy mainframe, and run a compliance agent as a DaemonSet on every node. The platform team already operates Kubernetes clusters with custom node pools.

**Which deployment target should you choose?**

* **A.** Agent Runtime, using `agents-cli deploy -d agent_runtime`.
* **B.** GKE, using `agents-cli deploy -d gke`.
* **C.** Cloud Run, using `agents-cli deploy -d cloud_run`.
* **D.** A Compute Engine managed instance group running the agent in a container.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** GKE provides node-level control, including choice of accelerators, custom node pools, and DaemonSets, alongside multi-container pods, and it fits the team's existing Kubernetes operations.
  * **Why Distractor A fails:** Agent Runtime is fully managed and does not expose nodes, accelerators, or sidecars.
  * **Why Distractor C fails:** Cloud Run supports sidecars but does not offer node-level control, DaemonSets, or the required accelerator type.
  * **Why Distractor D fails:** It is not a CLI deployment target, and it means rebuilding orchestration, scaling, and rollout on raw VMs.

---

### **Question 2 (Domain 4 - Private Egress per Runtime)**

A reconciliation agent runs on Agent Runtime, and a notifications agent runs on Cloud Run. Both must reach a private-IP Cloud SQL instance in the company's VPC, and none of their traffic may cross the public internet.

**What should you do?**

* **A.** Use a Private Service Connect interface for Agent Runtime and Direct VPC egress for the Cloud Run service.
* **B.** Use Direct VPC egress for Agent Runtime and a Private Service Connect interface for the Cloud Run service.
* **C.** Create a Serverless VPC Access connector and attach it to both the Agent Runtime and the Cloud Run deployments.
* **D.** Give Cloud SQL a public IP, restrict its authorized networks, and connect both agents with the Cloud SQL connector.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Agent Runtime reaches a customer VPC through a Private Service Connect interface attached to a subnet. Cloud Run routes outbound traffic into the VPC with Direct VPC egress.
  * **Why Distractor B fails:** It swaps the two mechanisms. Each one belongs to the other runtime.
  * **Why Distractor C fails:** Serverless VPC Access connectors are a Cloud Run and Cloud Run functions option. Agent Runtime uses Private Service Connect interfaces.
  * **Why Distractor D fails:** The database would have a public endpoint, and traffic would leave the private network, which the requirement rules out.

---

### **Question 3 (Domain 4 - Token Cost Analytics)**

The finance team needs token cost broken down by agent and customer segment, queryable in SQL, with 13 months of history. Engineers currently export Cloud Trace data by hand each month and join it in spreadsheets. The team wants a solution with minimal custom code.

**What should you do?**

* **A.** Build Cloud Monitoring dashboards on the agents' token-usage metrics, grouped by agent name and segment label.
* **B.** Add structured logging of token counts to each tool and model call, and route the logs to BigQuery with a log sink.
* **C.** Enable the BigQuery Agent Analytics plugin on the ADK agents to stream conversation and token telemetry into BigQuery.
* **D.** Set trace sampling to 100 percent and use Trace Explorer queries to break down token usage by agent and segment.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** The plugin streams prompts, responses, token usage, and session metadata into BigQuery with no custom logging code, so finance can query it in SQL with long retention.
  * **Why Distractor A fails:** Dashboards are not SQL-queryable data for joins with finance data, and metric retention and labeling are limited.
  * **Why Distractor B fails:** It would work, but it adds custom logging code to every agent, which the plugin already replaces.
  * **Why Distractor D fails:** Traces are for debugging executions, not long-term cost reporting, and 100 percent sampling is expensive.

---

### **Question 4 (Domain 4 - Automated Prompt Optimization)**

A reconciliation agent fails 30 percent of the multi-currency cases in its golden dataset. Engineers have spent two weeks hand-editing the system instruction with little progress. The team wants an automated, metric-driven way to improve the instruction against the existing dataset, without changing the model.

**What should you do?**

* **A.** Run `agents-cli eval analyze` to cluster the failing cases, then keep hand-editing the instruction with those clusters in mind.
* **B.** Fine-tune the model on the golden dataset so that it learns the multi-currency rules directly from the reference cases.
* **C.** Add every failing golden case to the system instruction as a few-shot example so that the agent learns the expected answers.
* **D.** Run `agents-cli eval optimize` with the golden dataset and the target metric to refine the system instruction iteratively.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** `eval optimize` uses the GEPA optimizer to rewrite the instruction repeatedly against the dataset and target metric, replacing manual trial and error.
  * **Why Distractor A fails:** It is a good diagnostic step, but the improvement is still manual.
  * **Why Distractor B fails:** It changes the model, which is out of scope, costs far more, and trains on the evaluation data.
  * **Why Distractor C fails:** Putting the test cases into the prompt overfits to the evaluation set, so the scores stop being meaningful.

---

### **Question 5 (Domain 4 - Canary Release Signals)**

Version 2 of the reconciliation agent is receiving 10 percent of traffic as a canary. Latency and error-rate dashboards look the same as for v1, and the product lead wants to move to 100 percent today.

**What should you check before promoting v2?**

* **A.** Latency and error rates, plus token spend per request, since together these fully describe the service's objectives.
* **B.** Business outcomes, application telemetry, and user feedback, each compared between v1 and v2 over the canary period.
* **C.** Re-run the offline evaluation suite on v2 and promote it if its score is equal to or higher than v1's score.
* **D.** Raise v2 to 50 percent for a day and promote it if latency and error rates stay flat at the larger share.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Agent releases are judged along three dimensions: business results (for example, settlement completion and escalations), telemetry (latency, errors, and tokens), and user feedback. An agent can be fast and error-free and still give worse answers.
  * **Why Distractor A fails:** Telemetry alone misses the outcome and user signals that show whether v2's reasoning got worse.
  * **Why Distractor C fails:** Offline evaluation was already a pre-release gate. The canary exists to measure behavior on live traffic.
  * **Why Distractor D fails:** It exposes more users to v2 while looking at the same incomplete metrics.
