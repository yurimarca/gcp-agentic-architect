Five scenario-based questions for **Scenario 5 (Cross-Organization Logistics Agent Collaboration - A2A)**.

---

### **Question 1 (Domain 3 - Choosing an Interoperability Pattern)**

A logistics company's North America agent, built with ADK in Python and running on Agent Runtime, needs to hand international shipment questions to the Europe agent. The Europe agent is written in Java, runs in a subsidiary's own Google Cloud project, and is released on the subsidiary's own schedule. It reasons over several steps, sometimes asks the caller clarifying questions, and returns customs PDFs. One engineer suggests exposing the Europe agent's customs functions as an MCP server.

**What should you do?**

* **A.** Expose the Europe agent's customs functions through an MCP server on Cloud Run, and connect the North America agent to it with `McpToolset` over Streamable HTTP.
* **B.** Ask the subsidiary to port the Europe agent to Python ADK, and add it to the North America agent's `sub_agents` so that the two share one deployment.
* **C.** Have the Europe agent publish an agent card and serve the Agent2Agent (A2A) protocol, and have the North America agent consume it through `RemoteA2aAgent`.
* **D.** Wrap the Europe agent's REST endpoint in a custom Python function tool on the North America agent that posts the question and returns the response text.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** A2A is designed for independent agents that collaborate across projects, languages and release cycles. It supports multi-turn exchanges, long-running tasks and file artifacts, and the Europe agent keeps its own autonomy and codebase.
  * **Why Distractor A fails:** MCP exposes tools, which are single stateless function calls. The Europe agent's own reasoning, clarifying questions and task lifecycle are lost.
  * **Why Distractor B fails:** It removes the subsidiary's independence in language, project and release schedule, which the scenario requires to be kept.
  * **Why Distractor D fails:** A plain REST wrapper has no protocol for tasks, streaming status, clarifying turns or artifacts, so each of these has to be custom-built.

---

### **Question 2 (Domain 3 & Domain 5 - Least-Privilege Access for A2A)**

The North America agent runs on Agent Runtime with its own agent identity. It must discover the Europe agent in Agent Registry and then send it messages. The Europe agent is deployed on Agent Runtime in the subsidiary's project, which also contains about 20 other agents that the North America agent must not call. Your security team requires least privilege.

**What IAM configuration should you apply?**

* **A.** Grant the North America agent's principal `roles/agentregistry.viewer` on the registry, and `roles/aiplatform.user` on the Europe agent's reasoning engine resource only.
* **B.** Grant the North America agent's principal `roles/agentregistry.viewer` on the registry, and `roles/aiplatform.user` on the subsidiary's project.
* **C.** Grant the service account used by the CI/CD pipeline that deploys the North America agent `roles/agentregistry.viewer` and `roles/aiplatform.user` on the Europe agent's resource.
* **D.** Grant the North America agent's principal `roles/agentregistry.admin` on the registry, and `roles/aiplatform.user` on the Europe agent's reasoning engine resource only.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The calling agent's identity is the principal that needs access. It needs to read the registry to discover the Europe agent and to invoke only that one reasoning engine. Granting at resource level keeps the other 20 agents out of reach.
  * **Why Distractor B fails:** A project-level `aiplatform.user` grant allows the North America agent to call every agent in the subsidiary's project.
  * **Why Distractor C fails:** The deployment pipeline's service account is not the identity the running agent uses, so the agent would still be denied.
  * **Why Distractor D fails:** The admin role allows registry entries to be changed, which is far more than discovery needs.

---

### **Question 3 (Domain 5 - Governing Outbound Agent Traffic)**

The North America agent calls the Europe agent and an external carrier-tracking API. Security requires that the agent can reach only approved destinations, that every call is authorized against the agent's own identity, and that outbound payloads are inspected for sensitive data. New destinations must be approved centrally rather than by editing network configuration for each agent.

**What should you do?**

* **A.** Create VPC firewall egress rules with FQDN objects that allow only the Europe agent's endpoint and the carrier API's hostname, and deny all other egress from the agent's subnet.
* **B.** Route the agent's outbound traffic through Secure Web Proxy with a URL list that contains the Europe agent's endpoint and the carrier API, and log all requests.
* **C.** Rely on the Europe agent's IAM check to reject unauthorized callers, and store the carrier API key in Secret Manager so that only the North America agent can read it.
* **D.** Route the agent's outbound traffic through Agent Gateway in Agent-to-Anywhere mode, register both destinations in Agent Registry, and attach a Model Armor template to inspect payloads.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** In egress mode, Agent Gateway intercepts the agent's outbound calls, checks the agent's identity against IAM, allows only destinations registered in Agent Registry (default deny), and applies Model Armor inspection. Approving a new destination means registering it in Agent Registry, not changing network rules.
  * **Why Distractor A fails:** Firewall rules filter by address or hostname only. They have no concept of the calling agent's identity, do not inspect payloads, and must be edited for each new destination.
  * **Why Distractor B fails:** Secure Web Proxy filters URLs, but it does not authorize calls per agent identity, does not use the central agent catalog, and does not apply Model Armor inspection.
  * **Why Distractor C fails:** It protects the Europe agent's side, but nothing limits where the North America agent can send traffic, and no payloads are inspected.

---

### **Question 4 (Domain 3 - Long-Running Tasks & Artifacts)**

The North America agent currently calls the Europe agent through a custom tool that sends a synchronous HTTP POST and waits for the response. A customs inspection can take up to 4 minutes, and the calls fail when the client times out after 60 seconds. The Europe agent's final output is a customs PDF. A teammate proposes raising all timeouts to 10 minutes.

**What should you do?**

* **A.** Raise the tool's HTTP client timeout and the Europe service's request timeout to 10 minutes, and return the PDF base64-encoded in the JSON response body.
* **B.** Switch to A2A: the Europe agent returns a task immediately, sends status updates while the inspection runs, and delivers the PDF as an artifact when the task is complete.
* **C.** Have the Europe agent write the PDF to a shared Cloud Storage bucket when it finishes, and have the North America agent's tool check the bucket every 10 seconds until the file appears.
* **D.** Split the request into two tools: one that starts the inspection and returns immediately, and one that the model calls repeatedly until the inspection result is returned as text.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** A2A is task-based. Long-running work is tracked through task status updates instead of an open HTTP request, and binary outputs are returned as artifacts. This is the built-in way to handle both requirements.
  * **Why Distractor A fails:** It works until an inspection takes longer than the new limit. It also keeps connections open for minutes, which proxies and load balancers may cut, and it inflates the response with a base64 PDF.
  * **Why Distractor C fails:** It works, but it is a custom coordination mechanism that needs cross-project bucket permissions and polling, reimplementing what A2A already provides.
  * **Why Distractor D fails:** Having the model poll wastes calls and tokens, and returning the inspection result as text still does not deliver the PDF.

---

### **Question 5 (Domain 3 & Domain 5 - Agent Identity Lifecycle)**

During an infrastructure upgrade, the subsidiary deleted the Europe agent and re-created it in the same project and region, with the same code and display name. Since then, the Europe agent receives `403 PERMISSION_DENIED` when it reads the customs-rules bucket. The bucket's IAM policy still shows a binding for the Europe agent's principal from before the upgrade.

**What should you do?**

* **A.** Wait up to seven minutes for IAM changes to propagate after the redeployment, and retry the request before changing any permissions on the bucket.
* **B.** Restart the Europe agent so that Agent Runtime provisions a fresh X.509 certificate for its identity, which re-establishes the existing bucket binding.
* **C.** Read the re-created agent's effective identity from its deployment, and grant the bucket role to that principal, replacing the binding for the old one.
* **D.** Redeploy the agent again, this time with the original display name set explicitly in the configuration, so that its SPIFFE identity matches the existing binding.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** An agent's SPIFFE identity includes its resource ID. A re-created agent gets a new ID and a new principal, so bindings for the old principal no longer apply. The fix is to grant roles to the new principal, or to use a project-scoped `principalSet` binding so that future re-creations do not break access.
  * **Why Distractor A fails:** Nothing was changed in IAM, so there is nothing to propagate. The binding is for a principal that no longer exists.
  * **Why Distractor B fails:** Certificates are provisioned and rotated automatically, and a new certificate does not change which principal the identity represents.
  * **Why Distractor D fails:** The display name is not part of the SPIFFE ID, so redeploying with any name produces yet another new principal.
