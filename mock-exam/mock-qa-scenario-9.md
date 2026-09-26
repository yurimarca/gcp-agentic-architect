Here are **5 realistic, scenario-based multiple-choice exam questions** built directly on **Scenario 9 (Strict Principal Access Boundary - PAB Enforcement)**, focusing on PAB policy creation, additive/fail-closed evaluation, CEL binding conditions, interaction with standard IAM Allow policies, and cryptographic SPIFFE identity attestation.

---

### **Question 1 (Domain 5 - Principal Access Boundary Policy Architecture & Binding)**

**Context:** A corporate investment bank is deploying an autonomous financial analysis agent running under a designated Service Account / Agent Identity. The agent executes financial analysis queries against dedicated Cloud Storage buckets in `project-finance-prod`. Security policy requires that even if an attacker successfully executes a prompt injection attack on the agent, the agent physically cannot access buckets in `project-hr-prod` or `project-legal-prod`, regardless of any resource-level IAM permissions that might be granted in those projects.

**Goal:** Restrict the universe of resources the agent's principal identity is eligible to access.

**Constraints:**
* Must attach explicit resource boundary restrictions directly to the **principal set** rather than modifying IAM policies on every individual target resource.
* The boundary evaluation must be **fail-closed** and independent of LLM system prompt instructions.

**Which security mechanism should you implement?**

* **A.** Create a **Principal Access Boundary (PAB) policy** defining `project-finance-prod` as the allowed resource boundary, and bind the PAB policy to the agent's principal set.
* **B.** Configure a system prompt instruction stating: *"Under no circumstances should you execute queries against HR or Legal buckets."*
* **C.** Attach a Model Armor template in `Inspect only` mode to the financial analysis Cloud Storage API endpoint.
* **D.** Deploy an Agent Gateway in Client-to-Agent (ingress) mode and set the default rule to `ALLOW_ALL`.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** **Principal Access Boundary (PAB) policies** attach directly to principal sets (such as service accounts, agent identities, or workload identity pools) to define the explicit, maximum universe of Google Cloud resources those principals are eligible to access. PAB evaluation is **fail-closed** and enforced at the infrastructure level by IAM, guaranteeing that even if prompt injection occurs or resource-level IAM permissions are over-permissioned, access outside `project-finance-prod` is blocked.
  * **Why Distractor B fails:** Prompt instructions are soft guardrails susceptible to prompt injection or model jailbreaks; they offer zero infrastructure-level perimeter security.
  * **Why Distractor C fails:** Model Armor in `Inspect only` mode logs findings to Cloud Logging without blocking unauthorized access or restricting resource boundaries.
  * **Why Distractor D fails:** Client-to-Agent (ingress) gateway mode governs incoming client traffic; setting `ALLOW_ALL` grants unconstrained access rather than restricting outbound resource boundaries.

---

### **Question 2 (Domain 5 - PAB Evaluation Properties: Additive & Fail-Closed)**

**Context:** A security architect at an investment bank is reviewing the evaluation logic of Principal Access Boundary (PAB) policies applied to an agent's service account. The service account has two separate PAB policies bound to its principal set: Policy A allows access to `projects/123456` (Finance) and Policy B allows access to `projects/789012` (Analytics).

**Goal:** Understand how IAM evaluates multiple PAB policies and how system errors affect access control decisions.

**Which statement accurately describes PAB policy evaluation?**

* **A.** PAB policies are **additive** (the eligible resources represent the union of Policy A and Policy B), and evaluation is **fail-closed** (if IAM encounters an internal evaluation error, access is immediately denied).
* **B.** PAB policies are **subtractive** (only resources present in both Policy A and Policy B are allowed), and evaluation is **fail-open**.
* **C.** PAB policies evaluate sequentially until the first match, discarding subsequent policies, and default to allowing access if evaluation fails.
* **D.** PAB policies override resource-level Deny policies and allow access even if an explicit IAM Deny rule exists on the target resource.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Principal Access Boundary (PAB) policy evaluation follows two core security properties:
    1. **Additive**: When multiple PAB policies are bound to a principal set, the set of eligible resources is the **union** of all resource scopes defined across those policies.
    2. **Fail-Closed**: If IAM encounters an internal service error during PAB evaluation, access is immediately blocked to prevent unauthorized data access.
  * **Why Distractor B fails:** PAB policies are additive (union), not subtractive (intersection), and fail-closed, not fail-open.
  * **Why Distractor C fails:** PAB policies do not evaluate sequentially to drop remaining rules; all bound PAB rules contribute to the union of eligible resources.
  * **Why Distractor D fails:** PAB policies define eligibility boundaries; they do not override explicit IAM Deny policies or grant access on their own (a principal still needs an IAM Allow policy within the eligible boundary).

---

### **Question 3 (Domain 5 - Conditional PAB Bindings & Principal Attributes)**

**Context:** An enterprise wants to enforce a Principal Access Boundary policy across a shared GCP folder containing finance and analytics projects. However, security policy dictates that the PAB policy must restrict resources *only* for AI agent service accounts and SPIFFE agent identities, while exempting human security administrators who manage the same GCP folder.

**Goal:** Configure the PAB policy binding condition to target agent principals specifically.

**Constraints:**
* Must evaluate principal attributes directly within the PAB policy binding condition.
* Must NOT require creating separate GCP folders for human administrators and automated agents.

**Which condition attribute expression should you use in the PAB policy binding?**

* **A.** Use **`principal.type`** in the CEL condition expression to restrict policy enforcement to `iam.googleapis.com/ServiceAccount` and agent identity principal types.
* **B.** Use `resource.type == "compute.googleapis.com/Instance"` in the condition to match compute engine instances.
* **C.** Configure a system prompt instruction stating: *"Human admins are exempt from this policy."*
* **D.** Enable `ALLOW_UNAUTHENTICATED` on the agent's Cloud Run service endpoint.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** PAB policy bindings support Common Expression Language (CEL) conditions that evaluate principal attributes. Using **`principal.type`** allows security administrators to bind the PAB restriction specifically to automated service accounts or SPIFFE agent identities (`principal.type == 'iam.googleapis.com/ServiceAccount'`), leaving human administrator principals unaffected.
  * **Why Distractor B fails:** Matching `resource.type` conditions on Compute Engine instances filters targeted resources, not the principal identity type initiating the request.
  * **Why Distractor C fails:** System prompt instructions operate inside the LLM and cannot evaluate or bypass Google Cloud IAM PAB policy bindings.
  * **Why Distractor D fails:** Enabling unauthenticated access removes identity verification entirely, creating a severe security vulnerability.

---

### **Question 4 (Domain 5 - Combining IAM Allow Policies with PAB Boundaries)**

**Context:** A developer creates a new service account for a financial analysis agent and attaches a PAB policy that restricts the service account's eligible resource scope strictly to `projects/finance-analytics`. The developer does not grant any standard IAM roles or Allow policies to the service account, assuming the PAB policy grants necessary read access. When the agent runs, every Cloud Storage API request returns `HTTP 403 Forbidden`.

**Goal:** Diagnose why the agent cannot read Cloud Storage buckets in `projects/finance-analytics` and apply the correct IAM fix.

**Which statement explains the issue and provides the correct resolution?**

* **A.** PAB policies define resource eligibility boundaries but **do not grant access by themselves**. The developer must also grant the required IAM Allow role (e.g., `roles/storage.objectViewer`) to the service account within `projects/finance-analytics`.
* **B.** PAB policies automatically grant `roles/owner` on all eligible resources; the `HTTP 403` error indicates a Model Armor prompt injection block.
* **C.** The developer must disable VPC Service Controls on the project to allow PAB policies to take effect.
* **D.** The agent must be re-deployed to a local `stdio` MCP server to bypass IAM checks.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** PAB policies act as an **outer guardrail / eligibility boundary**. They specify the maximum set of resources a principal *can* access, but they **do not grant any permissions on their own**. To access a resource, a principal must satisfy two independent checks: (1) the target resource must be within its PAB boundary, and (2) it must possess a standard IAM Allow policy (e.g., `roles/storage.objectViewer`).
  * **Why Distractor B fails:** PAB policies never automatically grant `roles/owner` or any permissions; assuming PAB grants permissions is a fundamental IAM misconfiguration.
  * **Why Distractor C fails:** VPC Service Controls and PAB policies operate orthogonally; disabling VPC-SC is unnecessary and degrades perimeter security.
  * **Why Distractor D fails:** Moving to local `stdio` MCP servers does not grant GCP Cloud Storage IAM permissions.

---

### **Question 5 (Domain 5 - Cryptographic SPIFFE Identity Attestation & DPoP)**

**Context:** An investment bank deploys its financial analysis agent on Agent Runtime. The agent uses SPIFFE-based Agent Identity to authenticate across Agent Gateway when calling external financial data APIs.

**Goal:** Ensure that intercepted OAuth 2.0 or bearer tokens cannot be replayed by malicious third parties outside the trusted runtime container.

**Constraints:**
* Must enforce cryptographic proof-of-possession binding on tokens passing through Agent Gateway.
* Must leverage Google Cloud's native Agent Identity attestation mechanisms.

**Which cryptographic mechanism is enforced by Agent Identity across Agent Gateway?**

* **A.** **Demonstrating Proof of Possession (DPoP)** and mTLS certificate binding, which cryptographically binds tokens to the agent container's private key, rendering stolen tokens unusable on other hosts.
* **B.** Static API keys hardcoded in system instructions and refreshed every 30 days.
* **C.** Plaintext HTTP Basic Authentication headers passed over unencrypted HTTP connections.
* **D.** Storing raw private keys in local `/tmp/` container text files.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Agent Identity uses short-lived X.509 certificates and enforces **Demonstrating Proof of Possession (DPoP)** alongside mTLS across Agent Gateway. DPoP cryptographically binds issued access tokens to the specific private key held by the agent container instance. If an attacker intercepts a token, they cannot replay it from another host or container because they lack the underlying private key signature.
  * **Why Distractor B fails:** Hardcoded static API keys in system prompts violate credential management guidelines and lack cryptographic token binding.
  * **Why Distractor C fails:** Plaintext HTTP Basic Authentication over unencrypted connections exposes credentials to network sniffing and token theft.
  * **Why Distractor D fails:** Storing unencrypted private keys in `/tmp/` files exposes credentials to local file inclusion vulnerabilities and container compromise.