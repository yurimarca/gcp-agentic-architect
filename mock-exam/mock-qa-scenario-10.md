Here are the final **5 realistic, scenario-based multiple-choice exam questions** built directly on **Scenario 10 (Centralized Network Governance & Model Armor Sanitization)**, completing our 10-scenario mock suite!

---

### **Question 1 (Domain 5 - Agent Gateway Ingress vs. Egress Modes)**

**Context:** A telecommunications enterprise operates multiple AI agent applications deployed across Google Cloud. The architecture team needs to establish a centralized proxy layer that (1) authenticates incoming client traffic from IDEs and web apps before reaching the agents, and (2) intercepts all outbound API calls made by agents to third-party SaaS services to validate them against an enterprise catalog using a default-deny rule.

**Goal:** Configure Agent Gateway to manage both incoming and outgoing traffic streams.

**Which configuration mode combination should you deploy on Agent Gateway?**

* **A.** Deploy Agent Gateway in **dual mode**: using **Client-to-Agent (Ingress) mode** to frontend incoming client connections and **Agent-to-Anywhere (Egress) mode** to intercept outbound tool and API traffic.
* **B.** Deploy Agent Gateway strictly in `stdio` mode and disable IAM authentication on Cloud Run.
* **C.** Configure a Cloud NAT gateway for ingress and deploy a Model Armor template in `Inspect only` mode for egress.
* **D.** Deploy a gRPC proxy on Compute Engine and disable mTLS Context-Aware Access.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** **Agent Gateway** operates in two distinct functional modes:
    1. **Client-to-Agent (Ingress) mode**: Sits in front of agent runtimes to authenticate incoming client traffic, enforce IAP, and apply rate limits.
    2. **Agent-to-Anywhere (Egress) mode**: Intercepts outbound calls from agents to external web APIs or remote MCP servers, validating destinations against **Agent Registry** using a default-deny posture.
  * **Why Distractor B fails:** `stdio` is a local machine subprocess transport mechanism; it cannot act as a network gateway proxy, and disabling IAM authentication violates security baselines.
  * **Why Distractor C fails:** Cloud NAT handles outbound IP translation but cannot parse A2A protocol payloads, evaluate Agent Registry allowlists, or authenticate incoming client connections.
  * **Why Distractor D fails:** Unmanaged gRPC proxies add operational overhead and lack native Agent Registry and mTLS Context-Aware Access integration.

---

### **Question 2 (Domain 5 - Model Armor Prompt Injection Constraints)**

**Context:** Security testers evaluate an agent's Model Armor template configured for prompt injection detection. During testing, a user submits a single-word prompt: `"Ignore"`. The tester notices that Model Armor passes the single-word prompt through to the LLM without triggering a prompt injection evaluation warning.

**Goal:** Understand Model Armor's input evaluation constraints and ensure prompt injection policies function as expected.

**Which statement explains why the evaluation was skipped?**

* **A.** Model Armor's prompt injection detection engine requires input payloads to contain **at least 3 words** to trigger evaluation; shorter inputs do not meet the minimum token threshold.
* **B.** Single-word inputs automatically bypass Model Armor and disable Sensitive Data Protection (SDP) rules.
* **C.** Model Armor only evaluates model output responses, never incoming user prompts.
* **D.** Model Armor requires system prompts to be stored in the `user:` state namespace in ADK.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** In Google Cloud Model Armor, the prompt injection and jailbreak detection engine requires input text payloads to contain **at least 3 words**. Inputs shorter than 3 words do not contain sufficient semantic context for the prompt injection classifier and are passed through without triggering injection evaluation.
  * **Why Distractor B fails:** Short inputs do not disable SDP rules; SDP inspection (for PII/SSNs) still evaluates short strings.
  * **Why Distractor C fails:** Model Armor evaluates both incoming user prompts (input templates) and generated model outputs (output templates).
  * **Why Distractor D fails:** Model Armor templates are configured at the platform/gateway layer, completely independent of ADK state namespaces.

---

### **Question 3 (Domain 5 - Decoupling Model Armor Input vs. Output Templates)**

**Context:** A telecommunications firm deploys Model Armor to secure an agent handling billing inquiries. Security policies mandate that (1) user input prompts must be inspected inline for adversarial jailbreak attacks, and (2) generated model outputs must undergo Sensitive Data Protection (SDP) masking to redact account numbers and PII before leaving the platform perimeter.

**Goal:** Implement Model Armor templates following Google-recommended best practices.

**Which design pattern should you recommend?**

* **A.** Create **decoupled Model Armor templates**: an **Input Template** optimized for prompt injection detection applied to incoming user requests, and an **Output Template** configured with SDP de-identification rules applied to model responses.
* **B.** Create a single monolithic template, attach it only to the user prompt, and disable output inspection to reduce latency.
* **C.** Hardcode PII regex masking logic directly inside prompt system instructions.
* **D.** Deploy Model Armor in `Inspect only` mode on the client's web browser.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Google Cloud best practices dictate **decoupling input and output Model Armor templates**. Input templates focus on threat vectors unique to prompts (prompt injection, jailbreak, malicious URLs), while output templates focus on risks unique to generated responses (PII data leakage via SDP redaction, brand safety, hate speech).
  * **Why Distractor B fails:** Inspecting only user prompts misses data leakage risks where the LLM or backend tools inadvertently output raw PII in the final response.
  * **Why Distractor C fails:** Prompt system instructions are non-deterministic and easily bypassed via prompt injection or jailbreak techniques.
  * **Why Distractor D fails:** Model Armor is a server-side/gateway security service, not a client-side browser extension.

---

### **Question 4 (Domain 5 - VPC Service Controls & Agent Private Connectivity)**

**Context:** An agent running on Google Cloud processes proprietary customer network logs stored in BigQuery and Cloud Storage. Security regulations require establishing a data perimeter that prevents the agent from exfiltrating data to external untrusted endpoints or unauthorized GCP projects.

**Goal:** Secure the agent's data perimeter and private network egress.

**Constraints:**
* Must prevent data exfiltration to unauthorized external storage or projects.
* Outbound HTTP(S) traffic from the agent to approved external web APIs must pass through an explicit, inspecting web proxy within the customer VPC.

**Which architecture should you deploy?**

* **A.** Enclose the agent runtime, BigQuery, and Cloud Storage resources inside a **VPC Service Controls (VPC-SC) service perimeter**, configure **Private Service Connect (PSC) interfaces** (or Direct VPC Egress) for agent network connectivity, and route outbound web traffic through a **Secure Web Proxy**.
* **B.** Assign public IP addresses to all BigQuery tables and grant `roles/owner` to `allUsers`.
* **C.** Disable mTLS and route all agent egress traffic through Cloud NAT without VPC-SC perimeters.
* **D.** Store all customer network logs in the `app:` state namespace in ADK.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** **VPC Service Controls (VPC-SC)** creates an perimeter around GCP services (BigQuery, Cloud Storage, Agent Runtime) to block unauthorized data exfiltration. Connecting agent runtimes to the customer VPC via **PSC interfaces** (for Agent Runtime) or **Direct VPC Egress** (for Cloud Run) ensures private traffic flow, while a **Secure Web Proxy** provides URL-level filtering and inspection for approved outbound web traffic.
  * **Why Distractor B fails:** Assigning public IPs and granting `roles/owner` to `allUsers` completely exposes sensitive enterprise data to the public internet.
  * **Why Distractor C fails:** Cloud NAT handles IP translation but does not provide data perimeter exfiltration defense or web proxy filtering.
  * **Why Distractor D fails:** State namespaces are in-memory application variables; they cannot replace data perimeters or infrastructure network controls.

---

### **Question 5 (Domain 5 - Agent Gateway Default Deny & Platform API Allowlisting)**

**Context:** After deploying Agent Gateway in Agent-to-Anywhere (egress) mode, developers report that the agent fails during startup, returning `HTTP 498` error codes when attempting to call Vertex AI models or write audit logs.

**Goal:** Diagnose the root cause of the startup failure and restore normal agent operation.

**Which statement explains the failure and provides the correct resolution?**

* **A.** Agent Gateway enforces a **strict default-deny posture** for all outbound egress traffic. Essential platform endpoints (such as `aiplatform.googleapis.com`, `logging.googleapis.com`, and `secretmanager.googleapis.com`) must be explicitly **allowlisted in Agent Registry**.
* **B.** The `HTTP 498` error indicates that the agent's Python virtual environment corrupted the `uv.lock` file. Developers must delete the `/workspace/` directory.
* **C.** Agent Gateway requires all LLM prompts to be translated into base64 before making API calls.
* **D.** Model Armor in `Inspect and block` mode automatically blocks all Google Cloud APIs unless `min_instances` is set to `100`.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Agent Gateway operates under a strict **default-deny security model**. When egress interception is active, outbound calls to Google Cloud platform services required for basic agent operation (such as Vertex AI `aiplatform.googleapis.com`, Cloud Logging `logging.googleapis.com`, or Secret Manager `secretmanager.googleapis.com`) are blocked unless they are explicitly cataloged and allowlisted in **Agent Registry**.
  * **Why Distractor B fails:** HTTP 498 is an Agent Gateway traffic rejection status code, not a local Python `uv.lock` environment corruption error.
  * **Why Distractor C fails:** Agent Gateway parses standard JSON-RPC/REST/gRPC protocols; it does not require prompt strings to be base64-encoded.
  * **Why Distractor D fails:** Model Armor filters prompt content risks; it does not block platform API endpoints based on container `min_instances` settings.
