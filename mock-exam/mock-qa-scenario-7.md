Here are **5 realistic, scenario-based multiple-choice exam questions** built directly on **Scenario 7 (Serverless Deployment & Zero-Downtime Canary Rollout)**, focusing on deployment targets, traffic splitting, automated rollback triggers, cold-start mitigation, and session compatibility.

---

### **Question 1 (Domain 4 - Selecting Deployment Targets)**

**Context:** An insurance startup is ready to deploy its new Python ADK claims-processing agent to production. The engineering team wants a deployment target that handles serverless container management, integrates natively with Python ADK, and eliminates cluster or node management overhead.

**Goal:** Select the optimal Google Cloud deployment target.

**Constraints:**
* Must be a **fully managed, serverless** platform natively optimized for Python ADK agent runtimes.
* Must require **zero Kubernetes cluster or node pool management**.

**Which deployment target should you select?**

* **A.** Deploy the agent to **Agent Runtime** using `agents-cli deploy -d agent_runtime`.
* **B.** Deploy the agent as a StatefulSet on Google Kubernetes Engine (GKE) Standard with manual node pool scaling.
* **C.** Deploy the agent to a static Compute Engine VM instance running a custom systemd startup script.
* **D.** Deploy the agent into an App Engine Flexible environment using custom Docker SSH configurations.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** **Agent Runtime** on Gemini Enterprise Agent Platform is a fully managed, serverless execution environment designed specifically for Python ADK agents. It handles container provisioning, scaling, security isolation, and mTLS identity attestation out of the box without managing clusters or VMs.
  * **Why Distractor B fails:** GKE Standard requires managing Kubernetes nodes, pod manifests, and cluster control planes, violating the requirement for zero cluster management.
  * **Why Distractor C fails:** Compute Engine VMs are unmanaged infrastructure requiring manual OS patching, scaling, and systemd maintenance.
  * **Why Distractor D fails:** App Engine Flexible has higher cold-start latencies, lacks native ADK tooling integration, and requires managing custom app.yaml configurations.

---

### **Question 2 (Domain 4 - Canary Deployments & Traffic Splitting)**

**Context:** The insurance claims team has updated their agent code (version v2) to incorporate a new policy validation tool. To minimize production risk, they want to test v2 against live customer requests while keeping the majority of traffic on the stable version v1.

**Goal:** Implement a canary release strategy.

**Constraints:**
* Must route exactly **10% of live production traffic** to revision v2 and **90% to revision v1**.
* Traffic splitting must be enforced at the infrastructure/network routing layer without modifying prompt code or system instructions.

**Which strategy should you implement?**

* **A.** Configure **traffic splitting / revision allocation** on the deployment target (Agent Runtime or Cloud Run) to allocate 90% of incoming requests to revision v1 and 10% to revision v2.
* **B.** Add a system instruction in prompt code instructing the LLM to execute v2 logic for 10% of incoming user messages.
* **C.** Delete revision v1 immediately and rely on Cloud Build retries if v2 encounters errors.
* **D.** Deploy a Model Armor template in `Inspect and block` mode configured to drop 90% of incoming prompts.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Both Agent Runtime and Cloud Run natively support **revision-based traffic splitting**. Allocating 90% of traffic to revision v1 and 10% to revision v2 routes live user requests at the infrastructure layer cleanly without touching application code.
  * **Why Distractor B fails:** LLMs cannot perform deterministic traffic percentage routing; embedding routing logic in prompts wastes tokens and causes non-deterministic behavior.
  * **Why Distractor C fails:** Deleting v1 creates immediate downtime if v2 fails, defeating the purpose of a canary deployment.
  * **Why Distractor D fails:** Model Armor drops invalid/dangerous prompts; it cannot route traffic between application software revisions.

---

### **Question 3 (Domain 4 - Automated Monitoring & Zero-Downtime Rollback)**

**Context:** During the 90/10 canary rollout of claims agent v2, Cloud Monitoring detects a spike in 5xx HTTP errors and a 3-second increase in average response latency on revision v2.

**Goal:** Revert production traffic back to stable revision v1 instantly to protect customer experience.

**Constraints:**
* Must achieve **zero-downtime rollback**.
* Must update network routing configuration to send 100% of traffic back to revision v1 without re-building container images.

**Which action should the operations team take?**

* **A.** Trigger an automated or one-click traffic update setting **100% traffic allocation to revision v1** in Agent Runtime or Cloud Run.
* **B.** Re-run `agents-cli create --prototype` locally and upload the resulting zip file to Cloud Storage.
* **C.** Delete the Google Cloud Project and restore all resources from cold tape backups.
* **D.** Increase model temperature to `2.0` on revision v2 to bypass latency checks.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Revision management in serverless platforms keeps previous container revisions active in the background. Updating the traffic allocation map to set 100% traffic to revision v1 instantly reroutes network traffic at the gateway, completing a zero-downtime rollback in seconds.
  * **Why Distractor B fails:** Creating a new prototype locally requires rebuilding and re-testing code, taking minutes or hours while live production users experience errors.
  * **Why Distractor C fails:** Deleting the GCP project causes catastrophic enterprise downtime and data loss.
  * **Why Distractor D fails:** Raising model temperature increases hallucination rates and randomness; it does not resolve backend code exceptions or network latency.

---

### **Question 4 (Domain 4 - Cold-Start Optimization)**

**Context:** Claims processing agents experience sudden traffic spikes during major storm events. When scaling up from zero instances, the initial request on a new container instance experiences a 2.5-second "cold start" delay while initializing Python dependencies and pre-loading embeddings.

**Goal:** Eliminate cold-start latency for baseline user traffic during critical operational windows.

**Constraints:**
* Must guarantee that at least one container instance remains warm and ready to serve incoming requests instantly.
* Must preserve serverless autoscaling capabilities for traffic bursts beyond baseline capacity.

**Which configuration parameter should you adjust on the deployment revision?**

* **A.** Set **minimum instances (`min_instances = 1` or higher)** on the deployment revision configuration.
* **B.** Disable autoscaling and pin CPU allocation to 100% permanent utilization.
* **C.** Store container images on local developer laptops instead of Google Artifact Registry.
* **D.** Convert all Python ADK code into shell scripts executed via local bash tools.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Setting **`min_instances`** (e.g., `min_instances = 1`) ensures the platform keeps pre-warmed container instances running at all times. Incoming baseline requests hit warm containers with zero cold-start latency, while autoscaling dynamically provisions additional instances during traffic spikes.
  * **Why Distractor B fails:** Disabling autoscaling prevents the system from expanding capacity during storm traffic spikes, leading to request queueing or crashes.
  * **Why Distractor C fails:** Storing container images locally makes them unreachable by Google Cloud serverless deployment engines.
  * **Why Distractor D fails:** Converting Python ADK agent code to shell scripts destroys framework structure, state management, and tool integration.

---

### **Question 5 (Domain 3 & Domain 4 - State Compatibility Across Revisions)**

**Context:** During a 90/10 canary split between agent revisions v1 and v2, a customer engages in a multi-turn conversation. Because traffic splitting operates per request, turn 1 is routed to revision v1, while turn 2 is routed to revision v2.

**Goal:** Ensure the user's session history and active state remain fully accessible when switching between revisions mid-conversation.

**Constraints:**
* Must NOT store session state inside ephemeral local container instance memory.
* Must enforce schema compatibility for `session.state` across candidate code revisions.

**Which architectural combination guarantees session continuity?**

* **A.** Externalize short-term state using **`DatabaseSessionService`** (Cloud SQL / AlloyDB) or **`Agent Platform Sessions`**, and maintain backwards-compatible `session.state` schema definitions between v1 and v2.
* **B.** Save `session.state` to the local `/tmp/` directory of the v1 container instance and send local HTTP pings to v2.
* **C.** Force the user's browser to store the full session history in HTTP cookies up to 10MB.
* **D.** Disable session history completely and require users to re-submit full conversation context on every turn.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Externalizing session storage to a central, persistent service (`DatabaseSessionService` or `Agent Platform Sessions`) ensures that any instance—regardless of revision—can fetch and write to the active session. Maintaining schema compatibility between v1 and v2 prevents version mismatches when user turns hit different revisions.
  * **Why Distractor B fails:** Container `/tmp/` directories are isolated to individual container instances. Container instance v2 cannot read local disk files from container instance v1.
  * **Why Distractor C fails:** HTTP cookies are subject to strict browser size limits (~4KB), exposing conversation history to tampering and bandwidth bloat.
  * **Why Distractor D fails:** Disabling sessions severely degrades user experience by requiring users to re-explain their context on every turn.

---