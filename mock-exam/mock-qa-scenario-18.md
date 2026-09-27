Five scenario-based questions for **Scenario 18 (Hotel Concierge Agents Acting on Guests' Behalf)**.

---

### **Question 1 (Domain 3 - User-Delegated vs. Agent Credentials)**

A hotel concierge agent updates each guest's own profile on an airline partner's SaaS platform, which supports OAuth 2.0. It also calls the hotel's property management API using the hotel's own API key. Security requires that no shared credential be used for guest accounts, and that neither raw tokens nor raw keys ever appear in the agent's prompt or state.

**What should you do?**

* **A.** Use Auth Manager with 3-legged OAuth for the airline platform and a managed API key for the property management system.
* **B.** Store one airline partner API key in Secret Manager and pass each guest's loyalty number as a parameter when the agent updates that guest's profile.
* **C.** Implement the 3-legged OAuth flow in the agent's code and keep each guest's access and refresh tokens in `user:` state for later sessions.
* **D.** Use the agent's own Agent Identity to authenticate to the airline platform, and grant that identity access to every guest profile it may update.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Auth Manager brokers both kinds of authority: user-delegated OAuth for acting as the guest, and the agent's own API key for hotel systems. Credentials are stored encrypted and injected at the gateway, so the agent never handles them.
  * **Why Distractor B fails:** A single partner key is exactly the shared credential that is prohibited, and access is not scoped to each guest's consent.
  * **Why Distractor C fails:** The flow is right, but raw tokens in session state sit in the agent's memory, which breaks the rule.
  * **Why Distractor D fails:** A third-party SaaS provider does not trust Google agent identities, and acting for guests requires their consent, not the agent's own authority.

---

### **Question 2 (Domain 3 - Governing Agent Assets)**

The hotel group now has about 40 agents, a dozen remote MCP servers, and many custom skills across its brands. Teams keep rebuilding things that already exist. Security wants outbound agent calls to reach only approved endpoints, and orchestrator agents should be able to discover which approved agents and tools are available.

**What should you do?**

* **A.** Keep a YAML manifest of approved agents and endpoints in a shared Git repository, and validate it in CI before each deployment.
* **B.** Register the agents, MCP servers, and skills in Agent Registry, and let Agent Gateway check outbound calls against it.
* **C.** Publish every agent to Gemini Enterprise, so that approved agents appear in the agent gallery for teams and orchestrators to find.
* **D.** Give each agent an A2A agent card and have orchestrators read a maintained list of agent card URLs to discover what is available.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Agent Registry is the central inventory of approved agents, MCP servers, tools, and skills. Agent Gateway enforces it at runtime by checking outbound calls against the registry.
  * **Why Distractor A fails:** A manifest in Git documents intent, but nothing enforces it when an agent makes a call.
  * **Why Distractor C fails:** The Gemini Enterprise gallery is for end users finding agents. It does not catalog MCP servers or skills, and it does not control outbound traffic.
  * **Why Distractor D fails:** Agent cards describe an agent's capabilities, but a list of URLs gives neither central approval nor enforcement.

---

### **Question 3 (Domain 3 - Cross-Organization Agent Collaboration)**

The concierge agent is built with ADK. It must hand spa bookings to a booking agent owned by a partner company, built on a different framework, and hosted in the partner's own cloud. The concierge must discover what the partner agent can do and receive progress updates while the booking runs.

**What should you do?**

* **A.** Wrap the partner's booking REST API as an OpenAPI tool in the concierge agent, and call it whenever a guest asks for a spa booking.
* **B.** Ask the partner to expose its booking agent as an MCP server, and connect the concierge agent to it through `McpToolset`.
* **C.** Import the partner's booking agent as one of the concierge agent's `sub_agents`, so that the concierge can transfer booking requests to it.
* **D.** Have the partner expose its agent through an A2A server with an agent card, and connect to it from the concierge with `RemoteA2aAgent`.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** A2A is designed for agents that work across organizations and frameworks. The agent card advertises capabilities, and the protocol supports streaming progress and task lifecycles.
  * **Why Distractor A fails:** An API wrapper couples the concierge to endpoint details and gives neither capability discovery nor streamed progress from the agent.
  * **Why Distractor B fails:** MCP connects agents to tools. It does not model a collaborating agent with its own task lifecycle and progress updates.
  * **Why Distractor C fails:** Sub-agents must run in the same ADK application. A partner agent in another framework and cloud cannot be imported.

---

### **Question 4 (Domain 3 - Long-Running A2A Tasks)**

For yacht charters, the partner agent checks several vendors and can take up to 10 minutes to confirm. The concierge currently waits on a synchronous request with a 60-second timeout, and the request fails. A developer proposes raising every timeout on the path to 15 minutes.

**What should you do?**

* **A.** Raise the HTTP client and load balancer timeouts to 15 minutes so that the synchronous call can finish.
* **B.** Have the partner build a status endpoint, and have the concierge poll it every 30 seconds through a custom tool.
* **C.** Use A2A's task lifecycle, so that the partner returns a task, streams status updates, and delivers the itinerary as an artifact.
* **D.** Run the charter request inside a `ParallelAgent`, so that the concierge can keep talking to the guest while it waits.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** A2A handles long-running operations natively. The caller gets a task it can follow, receives streamed updates, and collects the result as an artifact without holding a connection open.
  * **Why Distractor A fails:** Long-held connections are fragile, give the guest no progress updates, and still fail if a charter takes longer than the new limit.
  * **Why Distractor B fails:** It would work, but it rebuilds task tracking that the protocol already provides.
  * **Why Distractor D fails:** Running concurrently does not change the timeout. The call to the partner still blocks and fails after 60 seconds.

---

### **Question 5 (Domain 5 - Human Confirmation for High-Risk Actions)**

The concierge agent can charge guests for upgrades. Policy requires explicit guest confirmation for any charge above $1,000 or any non-refundable charge. The control must hold even if a prompt injection hidden in a booking note manipulates the model. Smaller refundable charges should go through without an extra step.

**What should you do?**

* **A.** Add a system instruction that tells the agent to always ask the guest for confirmation before any charge above $1,000 or any non-refundable charge.
* **B.** Use a `before_tool_callback` or policy engine that holds qualifying charge calls until the guest explicitly confirms them.
* **C.** Create a Model Armor input template with prompt injection detection set to `Inspect and block`, so that manipulated instructions never reach the model.
* **D.** Remove the charge tool from the agent and email the guest a payment link for every upgrade, so that the guest completes each charge.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** A callback or policy engine runs in code, outside the model, and checks every call to the charge tool. It enforces human confirmation exactly where policy requires it, whatever the model has been told.
  * **Why Distractor A fails:** An instruction is exactly what a prompt injection can override.
  * **Why Distractor C fails:** It lowers the risk of injection but does not guarantee it, and it does not enforce the confirmation rule itself.
  * **Why Distractor D fails:** It adds friction to every charge, including small refundable ones that policy lets through.
