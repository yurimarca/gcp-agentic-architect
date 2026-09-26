Here are **5 realistic, scenario-based multiple-choice exam questions** built directly on **Scenario 2 (Developer Assistant with Model Context Protocol - MCP)**.

---

### **Question 1 (Domain 2 & Domain 3)**

**Context:** An engineering organization is deploying containerized Model Context Protocol (MCP) servers on Cloud Run to expose schema inspection and SQL execution tools across 16 PostgreSQL and AlloyDB instances. Software developers use the Agent Development Kit (ADK) inside VS Code and Antigravity IDEs to build internal coding assistants that connect to these tools.

**Goal:** Configure the local and cloud-deployed ADK agents to securely invoke tools hosted on the remote Cloud Run MCP server.

**Constraints:**
* Must use a standardized transport layer that operates over network HTTP/HTTPS connections.
* Must support passing IAM Bearer authentication tokens and allow stateless autoscaling on Cloud Run.
* Must avoid relying on local subprocess pipes or Standard I/O (`stdio`) redirections for remote database access.

**Which configuration should you recommend?**

* **A.** Instantiate `McpToolset` in ADK using `StreamableHTTPConnectionParams` (or SSE transport), providing the Cloud Run service URL and passing authorization token headers.
* **B.** Instantiate `McpToolset` in ADK using Standard I/O (`stdio`) transport params referencing a local `npx @modelcontextprotocol/server-postgres` process.
* **C.** Embed the database credentials and full connection strings directly into system prompt instructions using model context caching.
* **D.** Export the database tables into static CSV files and create a Dialogflow CX Unstructured Data Store.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** For remote MCP servers deployed on cloud infrastructure (like Cloud Run or GKE), the Model Context Protocol uses **Streamable HTTP / Server-Sent Events (SSE)**. In ADK, configuring `McpToolset` with `StreamableHTTPConnectionParams` allows the agent to establish an HTTPS connection, pass authorization headers (e.g., Bearer tokens / IAM), and interact statelessly with the containerized MCP server.
  * **Why Distractor B fails:** Standard I/O (`stdio`) transport is strictly designed for local subprocess execution on the developer's machine; it cannot establish remote network connections to Cloud Run endpoints.
  * **Why Distractor C fails:** Hardcoding database credentials in system prompts exposes raw secrets in prompt memory, violates security best practices, and does not provide programmatic API connection capabilities.
  * **Why Distractor D fails:** Static CSV exports in Dialogflow CX cannot perform real-time transactional SQL queries, schema updates, or dynamic database analytics required for a coding agent.

---

### **Question 2 (Domain 2)**

**Context:** A data engineering team deploys a self-hosted **MCP Toolbox for Databases** server on Cloud Run. The server exposes over 40 individual schema inspection, SQL formatting, and table querying tools. Developers notice that when loading the full MCP server into their ADK agent, prompt context windows become bloated with dozens of unneeded tool JSON schemas, increasing token billing and causing reasoning drift.

**Goal:** Reduce prompt context bloat while maintaining developer access to required database query tools.

**Constraints:**
* Must strictly enforce the principle of least privilege regarding exposed tool schemas.
* Must prevent loading all 40+ schemas into the agent's main context window on every turn.

**Which approach should you implement in ADK?**

* **A.** Apply a `tool_filter` allowlist parameter inside `McpToolset` to expose only the specific tools required by that agent (e.g., `tool_filter=["query_sales_db", "get_schema_summary"]`).
* **B.** Switch the base LLM model to Gemini 1.5 Pro and enable model context caching across all 40 tool schemas.
* **C.** Convert all 40 MCP tools into static system instructions embedded in the agent's system prompt.
* **D.** Deploy a Model Armor template with Sensitive Data Protection (SDP) rules to strip tool schemas from incoming prompts.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** `McpToolset` in ADK supports the `tool_filter` parameter. This allows developers to allowlist only the exact subset of tool functions required for the agent's specific role, preventing context window bloat and eliminating unneeded token costs while adhering to least privilege access.
  * **Why Distractor B fails:** Context caching reduces latency for fixed prompt prefixes but does not prevent schema overload from cluttering the model's active function-calling choices and causing reasoning drift.
  * **Why Distractor C fails:** Embedding raw JSON schemas in system instructions consumes context tokens just like tool declarations and removes native tool-calling validation.
  * **Why Distractor D fails:** Model Armor sanitizes PII and inspects safety/injection risks; it cannot filter or manage MCP tool schema definitions in application code.

---

### **Question 3 (Domain 2 & Domain 3)**

**Context:** You are designing a complex data analysis agent using ADK. The agent must execute SQL queries across 16 AlloyDB instances, process raw database outputs, and run iterative, multi-step trial-and-error reasoning loops to transform the retrieved data.

**Goal:** Select the tool architecture that prevents intermediate trial-and-error execution logs and massive SQL output payloads from cluttering the root orchestrator's context window.

**Constraints:**
* The root orchestrator's context window must remain clean and focused on user interaction.
* Must enable **model tiering** (e.g., using Gemini Flash for low-cost query execution sub-agents and Gemini Pro for root orchestrator reasoning).

**Which design pattern should you recommend?**

* **A.** Wrap the specialized database sub-agent as an `AgentTool` (Agent-as-a-Tool) attached to the root orchestrator agent.
* **B.** Attach all 16 AlloyDB connection functions directly as Custom Python Function Tools on the root orchestrator agent.
* **C.** Hardcode the 16 AlloyDB connection strings in system prompts and run `stdio` subprocess loops.
* **D.** Build a `ParallelAgent` workflow where all 16 instances are queried simultaneously on every turn regardless of user intent.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Wrapping a specialized sub-agent inside an `AgentTool` isolates the sub-agent's execution loop. All intermediate reasoning, trial-and-error retries, and raw database payloads stay inside the sub-agent's own context window, returning only the final synthesized result to the root orchestrator. This also enables model tiering (e.g., Gemini Flash for the sub-agent tool, Gemini Pro for the root).
  * **Why Distractor B fails:** Attaching all functions directly to the root orchestrator forces all raw database payloads, error tracebacks, and schema schemas into the root context window, causing rapid token bloat and increasing cost.
  * **Why Distractor C fails:** Hardcoding connection strings violates security guidelines and does not isolate reasoning loops.
  * **Why Distractor D fails:** Querying all 16 databases simultaneously on every turn causes massive unnecessary latency, database load, and token waste.

---

### **Question 4 (Domain 2 & Domain 4)**

**Context:** An engineering team is adopting `agents-cli` to standardize building, testing, evaluating, and deploying ADK coding agents across local IDEs (VS Code/Antigravity) and Google Cloud.

**Goal:** Set up `agents-cli` in the local development environment and automatically equip developer coding assistants with specialized skills for ADK code patterns, evaluation, and deployment workflows.

**Constraints:**
* Must install the CLI toolchain and register context-aware skills without manually copying Markdown prompt files into each developer's IDE directory.
* Must support rapid local prototyping with interactive testing before deploying infrastructure to Google Cloud.

**Which command workflow should you execute?**

* **A.** Run `uvx google-agents-cli setup` to install the CLI and register injected skills, create a prototype project with `agents-cli create --prototype`, and test locally using `agents-cli playground`.
* **B.** Run `gcloud builds submit` to build a container image, deploy directly to GKE, and inspect pod stdout logs.
* **C.** Create a Cloud Shell environment and run `pip install google-adk` manually on every developer workspace restart.
* **D.** Import the `agents-cli-manifest.yaml` file into the Dialogflow CX Console as a custom entity type.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Running `uvx google-agents-cli setup` automatically installs `agents-cli` and injects the 7 context-aware developer skills (scaffolding, ADK coding, evaluation, deployment, etc.) into detected IDEs. `agents-cli create --prototype` creates a minimal project, and `agents-cli playground` launches a local web UI for instant hot-reloading tests before committing to cloud deployments.
  * **Why Distractor B fails:** Deploying to GKE before local prototyping adds heavy infrastructure overhead and slows down the development iteration cycle.
  * **Why Distractor C fails:** Manual `pip install` in Cloud Shell does not inject the CLI developer skills into local IDE coding assistants.
  * **Why Distractor D fails:** `agents-cli-manifest.yaml` is a project configuration manifest for coding agents, not an entity schema for Dialogflow CX.

---

### **Question 5 (Domain 2)**

**Context:** Data engineers at a financial services firm want to equip IDE coding assistants (VS Code / Antigravity) with capabilities to query schema structures, construct SQL queries, and orchestrate analytics pipelines across BigQuery, Spanner, Dataproc, and Cloud Storage.

**Goal:** Enable natural language data engineering tools in the IDE without forcing developers to manually copy-paste massive DDL table schemas into prompt windows.

**Constraints:**
* Must leverage Google's open-source extension and skill pack built specifically for data engineering and analytics IDE workflows.
* Must seamlessly bridge IDE coding agents to Google Cloud Data Cloud services via MCP toolboxes and data skills.

**Which product or plugin should you integrate into the development environment?**

* **A.** Install and configure the **Data Agent Kit (DAK)** plugin in the IDE / CLI coding assistant environment.
* **B.** Configure a Dialogflow CX Generator with custom entity types for every BigQuery column.
* **C.** Grant the coding agent execution rights to run raw `bq` CLI commands via unconstrained local bash execution tools.
* **D.** Set up a Vertex AI Search Web Data Store pointing to public SQL documentation.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** **Data Agent Kit (DAK)** is Google Cloud's open-source plugin and skill pack designed specifically for data engineers and data scientists. It equips IDE/CLI coding agents with pre-built data skills and MCP toolboxes that bridge natural language prompts directly to 20+ Google Data Cloud services (BigQuery, Spanner, Dataproc, dbt), eliminating manual schema copy-pasting.
  * **Why Distractor B fails:** Dialogflow CX Generators are for conversational chatbots, not IDE-based data engineering coding agents.
  * **Why Distractor C fails:** Giving an agent unconstrained raw bash access to run `bq` CLI without structured schema tools or guardrails creates severe security and command-injection risks.
  * **Why Distractor D fails:** Public SQL documentation provides generic syntax examples but cannot inspect internal corporate database schemas or execute data pipelines.

---