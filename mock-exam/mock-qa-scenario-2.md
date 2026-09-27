Five scenario-based questions for **Scenario 2 (Developer Assistant with Model Context Protocol - MCP)**.

---

### **Question 1 (Domain 2 & Domain 3 - Remote MCP Transport)**

Your platform team runs a shared MCP Toolbox for Databases server on Cloud Run. It holds the connection pools and Secret Manager credentials for 16 PostgreSQL and AlloyDB instances, and the service requires authentication. Developers built an ADK agent that works on their laptops, where `McpToolset` launches the Toolbox binary locally over `stdio`. After the agent was deployed to Agent Runtime, every tool call fails. Security requires that database credentials stay only in the shared server and that every tool call is attributable to the calling agent's identity.

**What should you do?**

* **A.** Add the Toolbox binary and its configuration to the agent's deployment package so the `stdio` connection works the same way in Agent Runtime as it does on developer laptops.
* **B.** Configure `McpToolset` with `StreamableHTTPConnectionParams` pointing to the Cloud Run service URL, pass an identity token for the agent in the authorization header, and grant the agent's identity permission to invoke the service.
* **C.** Allow unauthenticated invocations on the Cloud Run service, restrict its ingress to internal traffic, and connect to it from the agent with `StreamableHTTPConnectionParams`.
* **D.** Configure `McpToolset` with `StreamableHTTPConnectionParams` pointing to the Cloud Run service URL, and pass each database's user name and password in request headers so the server can open connections on the agent's behalf.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Remote MCP servers are reached over Streamable HTTP (or SSE), not `stdio`. Sending the agent's identity token lets Cloud Run authenticate the caller with IAM, so each call is attributable to the agent, and credentials stay in the shared server.
  * **Why Distractor A fails:** Bundling the binary would give every agent instance its own copy of the database credentials and its own connection pools, which is exactly what the shared server is meant to prevent.
  * **Why Distractor C fails:** Internal ingress limits where traffic comes from, but unauthenticated access removes IAM identity, so calls are no longer attributable to a specific agent.
  * **Why Distractor D fails:** Sending credentials from the agent moves the secrets into the agent, which violates the requirement that they stay in the shared server.

---

### **Question 2 (Domain 2 - Tool Schema Bloat)**

A shared MCP Toolbox server exposes 40 tools to several teams, including schema inspection, SQL formatting, read queries, and `execute_sql`. Your reporting agent needs only three read-only tools. Evaluation runs show that the agent sometimes chooses the wrong tool and, twice, called `execute_sql` to run an `UPDATE`. Token usage per turn is also high because every tool schema is sent to the model. The platform team does not want to run another server.

**What should you do?**

* **A.** Add to the agent's system instruction the names of the three tools it is allowed to use, and state that it must never run statements that modify data.
* **B.** Enable context caching for the agent's system instruction and tool declarations, so the 40 tool schemas are cached and not billed as new input tokens on every turn.
* **C.** Switch the agent to a model with a larger context window so that all 40 tool schemas fit with room to spare and do not crowd out the conversation.
* **D.** Set `tool_filter` on the agent's `McpToolset` to the three read-only tools it needs, so that only those schemas are loaded and only those tools can be called.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** `tool_filter` limits which of the server's tools the agent loads. The model sees only three schemas, which cuts tokens and reduces tool-selection mistakes, and `execute_sql` cannot be called at all. It needs no new infrastructure.
  * **Why Distractor A fails:** The model still sees all 40 schemas, so token usage is unchanged, and an instruction does not prevent it from calling `execute_sql`.
  * **Why Distractor B fails:** Caching reduces cost, but the model still chooses from 40 tools, so the wrong-tool and write problems remain.
  * **Why Distractor C fails:** Tool-selection accuracy and write safety are not caused by a lack of space; a larger window keeps all the same problems and costs more.

---

### **Question 3 (Domain 2 & Domain 3 - Isolating Sub-Agent Context)**

Your analyst assistant uses a Gemini Pro root agent for conversation. SQL exploration is delegated to a sub-agent through `sub_agents`, so the root transfers control to it. The SQL work involves many attempts, error messages, and large result sets. After a few questions, the session holds hundreds of thousands of tokens and answer quality drops. You also want the SQL work to run on Gemini Flash to reduce cost. The root agent needs only the final findings from each exploration.

**What should you do?**

* **A.** Wrap the SQL agent in an `AgentTool` on the root agent and configure it with Gemini Flash, so that only its final answer is returned to the root.
* **B.** Keep the SQL agent in `sub_agents` but configure it with Gemini Flash, so that the expensive exploration runs on the cheaper model while control transfers back and forth as before.
* **C.** Move the SQL tools onto the root agent and have them write raw query results to `temp:` state keys, so the results are discarded at the end of each turn.
* **D.** Switch the root agent to a model with a larger context window and enable context caching, so the growing session history fits and costs less per turn.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** `AgentTool` runs the child agent as a tool call. Its trial-and-error loop and large payloads stay inside its own execution, and the root receives only the final result. It also lets the child use a different, cheaper model (model tiering).
  * **Why Distractor B fails:** Model tiering is achieved, but transferred sub-agents share the session's event history, so all the attempts and large results still accumulate in the conversation the root sees.
  * **Why Distractor C fails:** Tool responses are added to the model's context when the tool returns, regardless of where the data is also stored in state, so the root's context still grows.
  * **Why Distractor D fails:** It postpones the problem and raises cost; quality still degrades as the context fills with irrelevant intermediate data.

---

### **Question 4 (Domain 2 - `agents-cli` Workflow)**

A team of 12 developers is starting a new ADK agent using Antigravity and Claude Code. Their coding assistants keep generating outdated ADK APIs. The team wants to prototype and test conversations locally for a few weeks before committing to any cloud infrastructure, and later add Cloud Run deployment with CI/CD to the same project.

**Which sequence should the team follow?**

* **A.** Run `uvx google-agents-cli setup`, create the project with `agents-cli create --prototype`, iterate with `agents-cli playground`, and later deploy the prototype with `agents-cli deploy -d cloud_run`.
* **B.** Create the project with `agents-cli create -d cloud_run` so the Dockerfile, Terraform and Cloud Build files exist from the start, and test each change by deploying it to a staging service.
* **C.** Run `uvx google-agents-cli setup`, create the project with `agents-cli create --prototype`, iterate with `agents-cli playground`, and later run `agents-cli scaffold enhance -d cloud_run` before deploying.
* **D.** Install `google-adk` with `pip`, add the current ADK documentation to each repository's assistant instruction file, and test locally with the ADK web UI.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** `setup` installs the CLI and injects the ADK skills into the developers' coding assistants, which fixes the outdated-API problem. `create --prototype` and `playground` support local iteration with no cloud infrastructure, and `scaffold enhance` later adds the Dockerfile, Terraform and CI/CD for Cloud Run to the existing project.
  * **Why Distractor A fails:** A prototype project has no deployment infrastructure. The `scaffold enhance` step is needed to add the Cloud Run files before deploying.
  * **Why Distractor B fails:** It commits to cloud infrastructure from day one and slows iteration, because every test needs a deployment. It also does not fix the coding assistants' outdated APIs.
  * **Why Distractor D fails:** Copying documentation into each repository is manual and goes stale, and it provides none of the CLI's scaffolding, evaluation or deployment workflows.

---

### **Question 5 (Domain 2 - Data Agent Kit)**

Data engineers at a financial services firm want their VS Code coding assistant to write BigQuery SQL, build dbt models, and submit Dataproc jobs. Today they paste table schemas into the chat by hand. The platform team has proposed building a custom MCP server that wraps the BigQuery and Dataproc APIs. Management wants the option that requires the least building and maintenance while covering all these data services.

**What should you do?**

* **A.** Deploy MCP Toolbox for Databases with a BigQuery source, and connect the coding assistant to it for schema discovery and query execution.
* **B.** Install Data Agent Kit in the developers' IDE and coding-assistant environment to add Google's prebuilt data skills and MCP toolboxes.
* **C.** Approve the custom MCP server on Cloud Run that wraps the BigQuery, dbt and Dataproc APIs, and register it in each developer's assistant configuration.
* **D.** Allow the coding assistant to run `bq` and `gcloud dataproc` commands in the terminal using each developer's own credentials, with a read-only role on production datasets.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Data Agent Kit is Google's open-source extension and skill pack for data engineering in IDEs and CLI coding agents. It covers BigQuery, Spanner, Dataproc, dbt and other Data Cloud services with prebuilt skills and MCP toolboxes, so there is nothing to build or operate.
  * **Why Distractor A fails:** Toolbox helps with database schema discovery and queries, but it does not provide the dbt and Dataproc pipeline skills the engineers need.
  * **Why Distractor C fails:** It would work, but it is exactly the custom build-and-maintain effort management wants to avoid.
  * **Why Distractor D fails:** Raw CLI access gives the assistant no structured schema context or data skills, and letting an assistant run arbitrary commands with personal credentials is hard to govern.
