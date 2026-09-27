Five scenario-based questions for **Scenario 7 (Serverless Deployment & Zero-Downtime Canary Rollout)**.

---

### **Question 1 (Domain 4 - Selecting a Deployment Target)**

The insurance startup is deploying a new fraud-triage agent built with Python ADK. The team is three Python developers with no container or Kubernetes experience. They want managed sessions and memory with as little operational work as possible. A separate team already runs several Node.js services on Cloud Run and has offered to host the agent there.

**Where should you deploy the fraud-triage agent?**

* **A.** On Cloud Run, using the other team's existing setup, with a Dockerfile for the agent and `DatabaseSessionService` backed by Cloud SQL for sessions.
* **B.** On GKE Autopilot, so that Google manages the nodes while the team keeps full control of the agent's pods, scaling policies and networking configuration.
* **C.** On Cloud Run functions, deploying the agent as an HTTP-triggered function so that no container image or Dockerfile has to be maintained by the team.
* **D.** On Agent Runtime, using `agents-cli deploy -d agent_runtime`, which provides a fully managed runtime for Python ADK agents with managed sessions and memory.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Agent Runtime is built for Python ADK agents. It manages scaling, identity, sessions and memory integration, so a small Python team without container experience has the least to operate.
  * **Why Distractor A fails:** Cloud Run is a valid serverless option, but the team would own the container, the session database and the wiring between them, which is more operational work than Agent Runtime for a Python-only ADK agent.
  * **Why Distractor B fails:** Autopilot removes node management, but the team still has to write and operate Kubernetes manifests, which it has no experience with.
  * **Why Distractor C fails:** Functions are designed for short, event-driven handlers. They do not provide managed agent sessions or memory, and they are a poor fit for a long-running conversational agent.

---

### **Question 2 (Domain 4 - Canary Release on Cloud Run)**

The claims agent runs on Cloud Run. Version 2 adds a new policy-validation tool. Before any customer traffic reaches v2, the QA team wants to test it on the production service. After QA approves it, 10% of customer traffic should go to v2 and 90% should stay on v1. No customer should receive v2 before QA has approved it.

**What should you do?**

* **A.** Deploy v2 with no traffic and a revision tag, have QA test it through the tag's dedicated URL, and then update traffic to send 10% to v2 and 90% to v1.
* **B.** Deploy v2 as a separate Cloud Run service, have QA test that service's URL, and then configure a load balancer with weighted backends that send 10% of traffic to v2.
* **C.** Deploy v2 normally, and immediately afterwards update traffic to send 10% to v2 and 90% to v1 so that QA can test with the real customer traffic split in place.
* **D.** Deploy v2 with no traffic, and add logic to v1 that forwards 10% of requests to v2 based on a hash of the customer ID, so that each customer consistently sees one version.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** A revision deployed with no traffic and a tag gets its own URL that only QA uses. Once QA approves, a traffic update splits production traffic 90/10 between the revisions. Customers never see v2 before approval.
  * **Why Distractor B fails:** It works, but it adds a second service and a load balancer to manage when Cloud Run's built-in revision traffic splitting already provides the same result.
  * **Why Distractor C fails:** A normal deploy sends 100% of traffic to v2 until the split is applied, so customers are exposed to v2 before QA approves it.
  * **Why Distractor D fails:** It moves routing into application code, which the platform already handles, and adds a code change and an extra network hop for every forwarded request.

---

### **Question 3 (Domain 4 - Rollback)**

Twenty minutes into the 90/10 canary, Cloud Monitoring shows that the v2 revision's 5xx error rate has jumped to 8%. Revision v1 is still deployed and healthy. The on-call engineer must stop customer impact as quickly as possible, and the development team wants to investigate the v2 revision afterwards.

**What should the on-call engineer do?**

* **A.** Redeploy the v1 container image from Artifact Registry as a new revision with 100% of traffic, so that the service is guaranteed to run a known-good build.
* **B.** Revert the v2 commit in the repository and let the CI/CD pipeline rebuild, evaluate and deploy the previous version through the normal release process.
* **C.** Update the service's traffic settings to send 100% of traffic to the existing v1 revision, and leave the v2 revision deployed with no traffic.
* **D.** Delete the v2 revision, so that Cloud Run automatically sends all of its traffic back to the remaining healthy v1 revision.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** A traffic update takes effect in seconds, needs no build, and sends everyone to the known-good revision. The v2 revision stays available, without traffic, for investigation.
  * **Why Distractor A fails:** It works, but it creates and starts a new revision, which is slower than moving traffic to the v1 revision that is already running.
  * **Why Distractor B fails:** A full build, evaluation and deploy cycle takes minutes to hours, during which customers keep receiving errors.
  * **Why Distractor D fails:** Cloud Run does not let you delete a revision that is receiving traffic, and deleting it would also remove what the team needs to investigate.

---

### **Question 4 (Domain 4 - Cold Starts)**

Claims traffic is close to zero overnight and rises sharply during storms. The first requests to each new instance take about 2.5 seconds longer while dependencies load. The business wants the first claims of a storm to be answered without that delay, while keeping overnight costs low and still scaling for storm peaks.

**What should you do?**

* **A.** Change the service's billing to instance-based billing (CPU always allocated), so that instances keep their loaded dependencies ready between requests.
* **B.** Set a small minimum number of instances, such as 1 or 2, and enable startup CPU boost, while keeping a maximum that is high enough for storm peaks.
* **C.** Create a Cloud Scheduler job that sends a request to the service every minute, so that Cloud Run keeps an instance running and does not scale it down to zero.
* **D.** Set the minimum number of instances to the number needed for a typical storm peak, so that the full storm capacity is always running and ready.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Minimum instances keep a small warm baseline, so the first requests avoid the cold start, and autoscaling still adds instances for peaks. Startup CPU boost shortens the start time of the instances added during a spike.
  * **Why Distractor A fails:** CPU allocation affects how instances are billed and whether they have CPU between requests; with a minimum of zero, the service still scales to zero and cold-starts.
  * **Why Distractor C fails:** A workaround with no guarantee. Cloud Run can still replace or scale down the instance, and it adds unnecessary requests.
  * **Why Distractor D fails:** It removes cold starts but pays for storm-level capacity all night, which breaks the cost requirement.

---

### **Question 5 (Domain 3 & Domain 4 - State Compatibility Across Revisions)**

The claims agent stores sessions in `DatabaseSessionService`. In v2, the developers renamed the state key `claim_step` to `claim_stage` and changed its values from integers to strings. During the 90/10 canary, some customers' conversations restart from the beginning. Traces show their turns alternating between v1 and v2 revisions within the same session.

**What should you do?**

* **A.** Enable session affinity on the service, so that each customer's turns stay on the revision that served their first request for the whole conversation.
* **B.** Configure v1 and v2 to use separate session databases, so that each revision always reads state in the format it expects and cannot corrupt the other.
* **C.** Before continuing the canary, run a script that converts every existing session to the new `claim_stage` key and string values used by v2.
* **D.** Change v2 to read either key and to keep writing `claim_step` in the old format alongside `claim_stage` until v1 is retired, then remove the old key.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Because traffic is split per request, both revisions read and write the same sessions during the canary. An expand-and-contract change keeps the state readable by both versions and removes the old key only after v1 no longer serves traffic.
  * **Why Distractor A fails:** Session affinity is best effort. When instances scale or restart, a customer can still move to the other revision and hit the incompatible state.
  * **Why Distractor B fails:** A customer who moves between revisions would find no session at all in the other database, which makes the problem worse.
  * **Why Distractor C fails:** v1 still serves 90% of traffic and does not understand the new key and format, so migrating every session breaks the majority of conversations.
