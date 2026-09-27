Five scenario-based questions for **Scenario 14 (Automotive Manufacturer Exposing Systems via MCP)**.

---

### **Question 1 (Domain 2 - Choosing an MCP Transport)**

An automotive manufacturer built an MCP server that queries plant-floor databases. Developers run it on their laptops against local Docker databases while working in their coding assistants. The same server must also serve ADK agents running on Cloud Run in production, where it must scale on its own and authenticate callers with IAM. One engineer proposes bundling the server into each agent's container and starting it as a subprocess.

**What should you recommend?**

* **A.** Use `stdio` locally, and run production as its own Cloud Run service that agents reach over Streamable HTTP with IAM tokens.
* **B.** Use `stdio` in both environments, bundling the server as a subprocess inside every agent container so that no network hop is added.
* **C.** Use Streamable HTTP in both environments, with developers' coding assistants connecting to the production server instead of their local databases.
* **D.** Use Streamable HTTP for local development and `stdio` in production, because `stdio` avoids network latency between the agent and its tools.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** `stdio` suits a local subprocess on a developer machine. A shared remote server that scales independently and uses IAM authentication needs an HTTP-based transport.
  * **Why Distractor B fails:** Every agent instance would start its own server with its own database connections and credentials. The server could not scale independently and could not be shared or authenticated centrally.
  * **Why Distractor C fails:** Developers would test against production data instead of their local databases, which is both a safety risk and slower.
  * **Why Distractor D fails:** It reverses the roles. `stdio` works only for a local subprocess and cannot reach a separately scaled remote service.

---

### **Question 2 (Domain 2 - Self-Hosted Database MCP Server)**

Agent teams need to query Cloud SQL, Spanner, and AlloyDB. Each team currently writes its own Python database tools with its own connection handling, and a recent incident exhausted the Cloud SQL connections. The platform team wants one shared approach, running inside the private VPC, that any MCP-capable agent can use without custom driver code.

**What should you do?**

* **A.** Connect the agents to the Knowledge Catalog managed remote MCP server and let them run their queries through its tools.
* **B.** Publish a shared Python library of database tools with a built-in connection pool, and require every agent team to import it.
* **C.** Deploy MCP Toolbox for Databases on Cloud Run inside the VPC, define the approved queries as tools, and connect agents to it with `McpToolset`.
* **D.** Add a Cloud SQL Auth Proxy sidecar to each agent and give the model one `execute_sql` function tool for all of its queries.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** MCP Toolbox for Databases is an open-source MCP server built for this job. It pools connections centrally, supports Cloud SQL, Spanner, and AlloyDB, runs privately on Cloud Run, and exposes standard MCP tools to any client.
  * **Why Distractor A fails:** Knowledge Catalog provides metadata and discovery. It is not a query-execution server with connection pooling for these databases.
  * **Why Distractor B fails:** Each process still opens its own pool, so connection pressure grows with every agent instance. The library also serves only Python agents and must be maintained by the platform team.
  * **Why Distractor D fails:** It does nothing for Spanner and still opens connections from every agent instance. Letting the model write arbitrary SQL is also a serious security risk.

---

### **Question 3 (Domain 2 - Credentials for a Self-Hosted MCP Server)**

The Toolbox server on Cloud Run needs database passwords. Today they are stored in `tools.yaml`, which is committed to a private repository and built into the container image. Security requires that no secrets appear in images or repositories, that access to them is audited, and that passwords can be rotated without rebuilding the image.

**What should you do?**

* **A.** Remove the passwords from `tools.yaml` and set them as plain Cloud Run environment variables from the CI pipeline at deploy time.
* **B.** Encrypt `tools.yaml` with a Cloud KMS key, commit the encrypted file, and decrypt it in a startup script when the container starts.
* **C.** Upload the passwords to a private Cloud Storage bucket that only the service account can read, and download them when the container starts.
* **D.** Store the passwords in Secret Manager, grant the Toolbox service account Secret Accessor on them, and reference the secrets in the Cloud Run service.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Secret Manager keeps secrets out of code and images, audits each access, and supports versioned rotation. Cloud Run can expose a secret to the service directly, so rotating it does not require rebuilding the image.
  * **Why Distractor A fails:** Plain environment variables are visible to anyone who can view the service configuration, and the secrets pass through the CI system.
  * **Why Distractor B fails:** The encrypted file still lives in the repository and the image, rotation still requires a rebuild, and the decryption code is custom.
  * **Why Distractor C fails:** Cloud Storage is not a secrets store. It has no secret versioning or rotation workflow, and it needs custom download code.

---

### **Question 4 (Domain 2 - Least-Privilege MCP Tools)**

A line-monitoring agent connects to a shared remote MCP server that exposes 30 plant tools, including write operations such as `halt_line` that other teams need. This agent should use only `check_assembly_line`, `get_part_status`, and `report_fault`. It sometimes calls unrelated tools, and its prompt carries all 30 tool schemas. The server is owned by another team and cannot be changed.

**What should you do?**

* **A.** Add a system instruction that lists the three permitted tools and tells the agent never to call any of the other tools on the server.
* **B.** Pass `tool_filter` with the three tool names to the agent's `McpToolset`, so that only those tools are loaded and exposed to the model.
* **C.** Deploy a second copy of the MCP server that enables only the three tools, and point this agent at the new copy.
* **D.** Wrap the `McpToolset` in a sub-agent exposed through `AgentTool`, so that the 30 schemas stay out of the main agent's context.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** `tool_filter` limits the tools the agent discovers to an allowlist. The model never sees the other schemas, which reduces the context size and removes tools such as `halt_line` from what it can call, without changing the server. Server-side IAM still sets the outer boundary.
  * **Why Distractor A fails:** An instruction is a soft control. All 30 schemas still load, and a confused or manipulated model can still call `halt_line`.
  * **Why Distractor C fails:** It works, but it creates a second server to deploy and keep in sync when a client-side filter solves the problem.
  * **Why Distractor D fails:** It moves the schemas out of the main context, but the sub-agent can still call all 30 tools, so least privilege is not achieved.

---

### **Question 5 (Domain 2 - Exposing an ADK Agent over MCP)**

A team built a supply-chain risk agent in ADK. Developers across the company want to call it from Claude Code and other MCP-capable IDE assistants as if it were a tool. The team does not want to write and maintain a separate server that wraps the agent.

**What should you do?**

* **A.** Publish the agent to Gemini Enterprise with `agents-cli publish` so that developers can call it from their IDE assistants.
* **B.** Expose the agent through an `A2AServer` and configure the IDE assistants to use its agent card to discover and call it.
* **C.** Write a small MCP server that calls the agent's HTTP endpoint, with one MCP tool for each question type the agent supports.
* **D.** Use ADK's `to_mcp_server` to expose the agent as an MCP server that the IDE assistants can connect to.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** `to_mcp_server` turns an ADK agent into an MCP server, so any MCP client, including IDE assistants, can call it as a tool without a separate wrapper.
  * **Why Distractor A fails:** Publishing to Gemini Enterprise makes the agent available to employees in the Gemini Enterprise app. It does not create an MCP endpoint for IDE assistants.
  * **Why Distractor B fails:** A2A is for agent-to-agent collaboration. The IDE assistants are MCP clients and cannot use an A2A agent card.
  * **Why Distractor C fails:** This is the separate wrapper the team wants to avoid, and ADK already provides the conversion.
