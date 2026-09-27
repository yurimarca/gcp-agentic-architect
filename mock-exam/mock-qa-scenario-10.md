Five scenario-based questions for **Scenario 10 (Centralized Network Governance & Model Armor Sanitization)**.

---

### **Question 1 (Domain 5 - Securing Client Access to Agents)**

A telecommunications company's developers use Claude Code and Cursor to connect directly to about 15 internal agents, each of which exposes its own endpoint. Security wants every client connection to be authenticated with the company's identity-aware access controls, prompts to be screened for injection attempts before they reach any agent, and per-client rate limits applied. The agent teams do not want to change their agents' code.

**What should you do?**

* **A.** Place the agents behind Agent Gateway in Agent-to-Anywhere mode, register the agents in Agent Registry, and attach a Model Armor template for prompt screening.
* **B.** Place the agents behind an external Application Load Balancer with Identity-Aware Proxy enabled, and use Cloud Armor rate-limiting rules for each client.
* **C.** Place the agents behind Agent Gateway in Client-to-Agent mode, with Identity-Aware Proxy authentication, a Model Armor template for prompt screening, and rate limits.
* **D.** Give each agent team a shared authentication and rate-limiting library, and call Model Armor's sanitize API from each agent before its model is invoked.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** In Client-to-Agent mode, Agent Gateway sits in front of the agents and applies Identity-Aware Proxy authentication, Model Armor prompt screening and rate limits centrally, without changes to agent code.
  * **Why Distractor A fails:** Agent-to-Anywhere mode governs the agents' outbound traffic; the requirement is about incoming client traffic.
  * **Why Distractor B fails:** It covers authentication and rate limits, but it has no Model Armor prompt screening and does not understand agent protocols.
  * **Why Distractor D fails:** It requires changing every agent's code, which the teams ruled out, and consistency depends on each team adopting the library correctly.

---

### **Question 2 (Domain 5 - Model Armor Prompt Injection Limits)**

A red team tests the billing agent, which is protected by a Model Armor input template with prompt injection and jailbreak detection in `Inspect and block` mode. Longer injection attempts are blocked. However, very short inputs such as "Ignore rules" or "Override" pass through without any prompt injection finding in the logs, and in a few cases they changed the agent's behavior.

**What should you do?**

* **A.** Lower the prompt injection confidence threshold in the template from `HIGH` to `LOW_AND_ABOVE`, so that weaker injection signals in short inputs are also flagged.
* **B.** Treat inputs under three words as unscreened, and add controls that do not depend on detection, such as tool authorization and confirmation of risky actions.
* **C.** Change the template's enforcement type to `Inspect only` during the investigation, so that every input, including short ones, is written to Cloud Logging with its findings.
* **D.** Configure Model Armor floor settings at the organization level, so that the prompt injection filter is enforced on every input regardless of the template's configuration.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Model Armor's prompt injection detection runs only on inputs of at least three words, so these inputs are never evaluated. The risk has to be reduced by other layers, such as limiting what tools can do and requiring confirmation for high-risk actions.
  * **Why Distractor A fails:** Thresholds apply to inputs that are evaluated. Short inputs are skipped entirely, so no threshold catches them.
  * **Why Distractor C fails:** `Inspect only` stops blocking the longer attacks that are currently being caught, and it still produces no finding for short inputs.
  * **Why Distractor D fails:** Floor settings enforce a minimum configuration on templates. They do not change the three-word minimum for evaluation.

---

### **Question 3 (Domain 5 - Separate Input and Output Templates)**

The billing agent uses a single Model Armor template, applied to both prompts and responses, with prompt injection, responsible AI and Sensitive Data Protection filters. Two problems have been reported. Customers who type their own account number to ask about their bill have it masked, so the agent cannot help them. Meanwhile, the real concern of the compliance team is responses that could expose other customers' account numbers.

**What should you do?**

* **A.** Remove the Sensitive Data Protection filter from the template, and rely on IAM controls in the billing database to stop the agent from retrieving other customers' records.
* **B.** Keep the single template on both prompts and responses, and change its enforcement type to `Inspect only` so that account numbers are logged rather than masked or blocked.
* **C.** Keep the single template on both prompts and responses, and exclude the account-number infoType from its Sensitive Data Protection configuration so that it is no longer masked.
* **D.** Create an input template for prompt injection and jailbreak detection, and a separate output template that masks account numbers with Sensitive Data Protection and applies responsible AI filters.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Prompts and responses carry different risks. Separate templates let the input template focus on attacks, so customers can share their own account numbers, while the output template masks account numbers before responses leave the platform.
  * **Why Distractor A fails:** IAM helps, but the compliance team's concern is what appears in responses, so removing output masking removes a required control.
  * **Why Distractor B fails:** Nothing is masked in either direction, so account numbers in responses reach customers.
  * **Why Distractor C fails:** Account numbers are then unmasked in responses as well, which is exactly the risk compliance cares about.

---

### **Question 4 (Domain 5 - Data Perimeter and Private Egress)**

An agent on Agent Runtime analyzes customer network logs stored in BigQuery and Cloud Storage. Regulators require that this data cannot be copied to projects outside the company's control, even by a compromised agent that holds valid credentials. The agent also calls three approved external SaaS APIs, and that outbound traffic must pass through an inspecting proxy in the company's VPC that allows only approved URLs.

**What should you do?**

* **A.** Put the agent, BigQuery and Cloud Storage projects in a VPC Service Controls perimeter, connect Agent Runtime to the VPC with a Private Service Connect interface, and send outbound web traffic through Secure Web Proxy with a URL allowlist.
* **B.** Put the agent, BigQuery and Cloud Storage projects in a VPC Service Controls perimeter, connect Agent Runtime to the VPC with a Private Service Connect interface, and send outbound web traffic through Cloud NAT with a reserved static IP address that the SaaS providers allowlist.
* **C.** Put the agent, BigQuery and Cloud Storage projects in a VPC Service Controls perimeter, connect Agent Runtime to the VPC with Direct VPC egress, and send outbound web traffic through Secure Web Proxy with a URL allowlist.
* **D.** Connect Agent Runtime to the VPC with a Private Service Connect interface, send outbound web traffic through Secure Web Proxy with a URL allowlist, and rely on IAM to keep data inside the company's projects.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The VPC Service Controls perimeter stops data from being copied to projects outside it, even with valid credentials. A Private Service Connect interface is how Agent Runtime connects to a customer VPC, and Secure Web Proxy inspects outbound traffic and allows only approved URLs.
  * **Why Distractor B fails:** Cloud NAT only translates addresses; it does not inspect traffic or filter URLs.
  * **Why Distractor C fails:** Direct VPC egress is a Cloud Run feature. Agent Runtime connects to a VPC through a Private Service Connect interface.
  * **Why Distractor D fails:** IAM does not stop a principal with valid credentials from writing data to a project outside the company, which is exactly what the perimeter prevents.

---

### **Question 5 (Domain 5 - Troubleshooting Agent Gateway Egress)**

After the security team routed an agent's outbound traffic through Agent Gateway in Agent-to-Anywhere mode, the agent fails during startup. Its calls to the model endpoint and to Cloud Logging return HTTP 498. The agent's identity still has `roles/aiplatform.user`, and nothing about the agent's code or network changed.

**What should you do?**

* **A.** Grant the agent's identity `roles/aiplatform.user` again at the project level, because moving traffic behind Agent Gateway requires the role to be granted again.
* **B.** Enable Private Google Access on the subnet used by the agent's Private Service Connect interface, so that calls to Google APIs can be routed to Google's endpoints.
* **C.** Register the essential Google Cloud endpoints, such as `aiplatform.googleapis.com` and `logging.googleapis.com`, in Agent Registry so Agent Gateway allows traffic to them.
* **D.** Attach a Model Armor template to the gateway, because Agent Gateway rejects outbound requests until a content inspection policy has been configured for them.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Agent Gateway's egress mode denies everything by default. Destinations must be registered in Agent Registry, including the Google Cloud APIs the agent needs to start. HTTP 498 is the gateway rejecting calls to endpoints that are not registered.
  * **Why Distractor A fails:** An IAM permission problem would return 403, and the role is already granted.
  * **Why Distractor B fails:** Nothing about the network changed, and a routing problem would cause timeouts or connection errors rather than a 498 response from the gateway.
  * **Why Distractor D fails:** Model Armor is an optional inspection step in the gateway's enforcement chain; it is not required before traffic is allowed.
