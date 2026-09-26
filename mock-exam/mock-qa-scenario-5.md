Here are **5 realistic, scenario-based multiple-choice exam questions** built directly on **Scenario 5 (Cross-Organization Logistics Agent Collaboration - A2A)**.

---

### **Question 1 (Domain 3 - Interoperability Protocols & Multi-Agent Architecture)**

**Context:** A multinational logistics enterprise operates a North America Logistics Agent built in Python and an independent Europe Logistics Agent built in Java by a separate regional subsidiary. The North America agent needs to delegate international shipment queries to the Europe agent across network boundaries. The interaction requires passing reasoning thought traces, handling 45-second long-running clearance tasks, and returning binary customs PDF file artifacts.

**Goal:** Select the multi-agent design pattern and protocol that meets all functional requirements without consolidating both agents into a single codebase.

**Which architecture should you recommend?**

* **A.** Expose the Europe Agent as an **`A2AServer`** and consume it in the North America Agent using a **`RemoteA2aAgent`** client proxy via the **Agent2Agent (A2A) protocol**.
* **B.** Refactor the Europe Agent code into Python and import it directly as a local `SequentialAgent` sub-agent running in the same application memory process.
* **C.** Wrap the Europe Agent inside a local `stdio` MCP server using `McpToolset`.
* **D.** Deploy a Dialogflow CX Generator and pass customs PDFs through session parameters.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The **Agent2Agent (A2A) protocol** is designed specifically for independent agents running as separate microservices across network boundaries, organizational teams, or programming languages (e.g., Python and Java). In ADK, exposing the Europe agent as an `A2AServer` and consuming it via `RemoteA2aAgent` natively supports preserving reasoning traces, tracking long-running tools without timeouts, and transferring file artifacts (customs PDFs).
  * **Why Distractor B fails:** Local sub-agents run in the same application memory process. Force-refactoring a Java microservice into a single Python monolith violates team independence, cross-language support, and modularity.
  * **Why Distractor C fails:** Standard I/O (`stdio`) MCP servers execute as local machine subprocesses and cannot connect to remote cloud services over cross-project networks.
  * **Why Distractor D fails:** Dialogflow CX session parameters are intended for short conversational text slots; they cannot transfer raw binary PDF file artifacts or handle cross-framework A2A reasoning traces.

---

### **Question 2 (Domain 3 & Domain 5 - IAM Delegation for A2A Communication)**

**Context:** The North America Logistics Agent uses a SPIFFE-based Agent Identity (`identity_type=AGENT_IDENTITY`) deployed on Agent Runtime. It needs to discover and send messages to the Europe Logistics Agent registered in **Agent Registry** across project boundaries.

**Goal:** Grant the minimum required IAM permissions to allow the North America Agent to discover and invoke the Europe Agent.

**Constraints:**
* Must adhere to the principle of least privilege.
* Permissions must be granted directly to the parent agent's **SPIFFE principal identity**, not to human developer user accounts.

**Which IAM role configuration should you apply?**

* **A.** Grant **`roles/agentregistry.viewer`** on the Agent Registry resource and **`roles/aiplatform.user`** on the target Europe agent's reasoning engine resource directly to the North America Agent's SPIFFE principal string.
* **B.** Grant `roles/owner` on the Google Cloud Organization to the human developer who deployed the North America agent.
* **C.** Generate a long-lived Service Account JSON key, embed it in the North America agent's `.env` file, and pass it in HTTP headers.
* **D.** Configure a Model Armor template in `Inspect only` mode on the Europe agent's project.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** When initiating A2A communication, the invoking parent agent acts as the principal. To discover the remote agent, the parent agent's SPIFFE principal string (`principal://agents.global.org-...`) requires `roles/agentregistry.viewer` on the registry. To send messages to the sub-agent, it requires `roles/aiplatform.user` on the target sub-agent's reasoning engine resource.
  * **Why Distractor B fails:** Granting `roles/owner` to a human developer violates least privilege and does not grant the automated agent runtime process the necessary permissions.
  * **Why Distractor C fails:** Agent identities eliminate long-lived service account JSON keys. Storing raw service account keys in `.env` files violates enterprise security controls.
  * **Why Distractor D fails:** `Inspect only` mode in Model Armor logs findings without granting IAM invocation permissions.

---

### **Question 3 (Domain 5 - Agent Gateway Egress & Network Governance)**

**Context:** Enterprise security rules dictate that all outbound A2A network calls originating from the North America Agent targeting external agents or APIs must be intercepted, validated against approved destinations, and inspected for sensitive data leaks.

**Goal:** Configure centralized network governance for outbound agent traffic.

**Constraints:**
* Must enforce a strict **default-deny** posture for all outbound connections.
* Essential Google Cloud platform APIs required by the agent runtime must be explicitly allowlisted to prevent execution failures.

**Which configuration sequence should you deploy?**

* **A.** Bind the agent to an **Agent Gateway operating in Agent-to-Anywhere (egress) mode**, register the Europe Agent endpoint in **Agent Registry**, and allowlist essential platform endpoints (e.g., `aiplatform.googleapis.com`, `logging.googleapis.com`) in the registry.
* **B.** Attach a Client-to-Agent (ingress) gateway to the North America Agent and disable mTLS certificate verification.
* **C.** Deploy a Cloud NAT gateway in the VPC network and grant `roles/run.invoker` to all users in the organization.
* **D.** Write a custom Python callback using `after_agent_callback` to intercept raw TCP network socket packets.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** **Agent Gateway in Agent-to-Anywhere (egress) mode** intercepts outbound agent communications. It enforces IAM access policies, verifies target endpoints in **Agent Registry**, and applies Model Armor filters. Because Agent Gateway enforces a strict *default deny* posture, essential platform APIs (such as `aiplatform.googleapis.com`, `logging.googleapis.com`, `secretmanager.googleapis.com`) must be allowlisted in Agent Registry to avoid runtime 498 initialization errors.
  * **Why Distractor B fails:** Client-to-Agent (ingress) mode governs incoming client requests to the agent, not outbound agent-to-agent calls. Disabling mTLS breaks Context-Aware Access security baselines.
  * **Why Distractor C fails:** Cloud NAT provides basic outbound IP translation; it cannot perform A2A protocol parsing, Agent Registry validation, or Model Armor payload inspection.
  * **Why Distractor D fails:** Python application callbacks operate inside the LLM runtime code; they cannot replace network-layer gateway enforcement or manage VPC egress security.

---

### **Question 4 (Domain 3 - Artifacts & Long-Running Tool Operations in A2A)**

**Context:** When the North America Agent invokes the Europe Agent to inspect an international container, the Europe Agent executes an asynchronous tool that scans customs databases and generates a PDF report. The operation takes 50 seconds to complete.

**Goal:** Ensure the A2A interaction completes successfully without incurring HTTP connection timeouts or losing the generated PDF.

**Constraints:**
* Must use built-in A2A protocol capabilities supported by ADK.
* Must pass the binary PDF report back to the calling agent as a structured artifact.

**Which mechanism does the A2A protocol use to satisfy these requirements?**

* **A.** A2A natively supports **long-running tools** by tracking asynchronous task status updates across streaming messages and uses **A2A Artifacts** to transmit binary files between agents.
* **B.** A2A converts binary PDF files into raw text strings inside system prompts and forces synchronous 5-second HTTP REST timeouts.
* **C.** The calling agent must save the PDF to a local container `/tmp/` folder and share the local file path string over a gRPC header.
* **D.** The sub-agent stores the PDF in a Dialogflow CX Custom Entity table.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The ADK **A2A protocol integration** explicitly supports three core capabilities: (1) preserving reasoning/thought traces, (2) tracking **long-running tools** via task status updates to prevent HTTP timeouts, and (3) passing **binary file artifacts** (like generated PDFs) between independent agents over the network.
  * **Why Distractor B fails:** Embedding binary PDFs as raw text in system prompts consumes massive context tokens and causes prompt corruption. Standard synchronous REST calls would time out after 50 seconds.
  * **Why Distractor C fails:** Local container `/tmp/` paths are ephemeral and local to the Europe agent's container; they are completely unreachable by a remote agent running in a separate project across network boundaries.
  * **Why Distractor D fails:** Dialogflow CX custom entities are designed for intent parameter extraction, not for storing or transferring binary PDF artifacts across ADK A2A agents.

---

### **Question 5 (Domain 3 & Domain 5 - SPIFFE Identity Lifecycle Management)**

**Context:** Due to an infrastructure upgrade, the Europe Logistics Agent reasoning engine instance is deleted and re-deployed in the same project and region with identical source code, system instructions, and display name.

**Goal:** Maintain security and access control for the newly deployed Europe Agent instance.

**Constraints:**
* Must understand how Google Cloud manages SPIFFE identity lifecycle and IAM bindings upon re-deployment.
* Must restore cross-project A2A invocation access for the North America Agent.

**Which action must the cloud security architect perform?**

* **A.** Query the new agent's **`spec.effectiveIdentity`** SPIFFE principal identifier and apply the required IAM allow policies to the new principal, because re-deploying an agent generates a new resource ID and a new SPIFFE principal string.
* **B.** Do nothing, because SPIFFE IDs are bound to the agent's display name and automatically inherit all previous IAM bindings.
* **C.** Manually extract the deleted agent's X.509 certificate from Secret Manager and import it into the new container image.
* **D.** Change the agent's identity type to a shared legacy service account and disable mTLS Context-Aware Access.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** An agent's SPIFFE principal identifier includes its unique underlying resource ID (e.g., `.../reasoningEngines/NEW_AGENT_ID`). When an agent is deleted and re-deployed—even with identical code and display names—it receives a **new resource ID and a new SPIFFE principal identifier**. Deleting the old agent leaves its IAM bindings inactive. Architects must retrieve the new `spec.effectiveIdentity` string and grant the required IAM roles to the new principal.
  * **Why Distractor B fails:** SPIFFE IDs are derived from immutable resource URIs, not display names. Old IAM bindings remain as inactive grants and do not automatically transfer to the new resource ID.
  * **Why Distractor C fails:** X.509 certificates are automatically provisioned and managed by Google Cloud with 24-hour validity periods; manually copying expired certificates is unsupported and breaks mTLS binding.
  * **Why Distractor D fails:** Downgrading to shared service accounts violates least privilege access, increases blast radius, and disables default Context-Aware Access security baselines.
