Five scenario-based questions for **Scenario 15 (Telecom Network Analytics with Agent Skills and Data Agent Kit)**.

---

### **Question 1 (Domain 2 - Skill Discovery and Context Cost)**

A telecom data team has installed 40 custom Agent Skills in its coding assistants. Some engineers worry that every session starts with a heavy context load, and they propose merging all 40 skills into one large skill. Before deciding, the lead wants to know what the assistant loads from each skill when a session starts.

**What is loaded at session start?**

* **A.** The full `SKILL.md` of every installed skill, so that the assistant can follow any of them without an extra load step.
* **B.** Each skill's `SKILL.md` instructions and its `references/` folder, while scripts in `scripts/` are loaded only when run.
* **C.** Nothing from any skill until a user names one explicitly, after which that skill's full contents are loaded.
* **D.** Only the name and description from each skill's `SKILL.md` frontmatter, with instructions and resources loaded on demand.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Skills use progressive disclosure. Level 1 is only the name and description, which is enough for the assistant to decide relevance. Instructions (level 2) and resources (level 3) load only when needed. Forty skills cost little at startup, and merging them into one would make things worse, because one skill's instructions would load in full whenever any part of it was needed.
  * **Why Distractor A fails:** Full instructions are level 2 and load only when the skill is activated.
  * **Why Distractor B fails:** References are level 3 resources and load on demand, not at startup.
  * **Why Distractor C fails:** The assistant needs the level 1 metadata to choose skills on its own. Users do not have to name a skill.

---

### **Question 2 (Domain 2 - Organizing Skill Resources)**

A 5G outage-analysis skill has a 1,200-line `SKILL.md`. It contains the step-by-step procedure, a Python log-parsing script pasted in as code blocks, the full 3GPP reference text, and a JSON schema of the network topology. The assistant is slow to use the skill, and it often rewrites the parsing script instead of running it.

**What should you do?**

* **A.** Split the content into five smaller skills, each with its own `SKILL.md`, so that each piece loads separately.
* **B.** Keep the procedure in `SKILL.md`, and move the script to `scripts/`, the schema to `assets/`, and the 3GPP text to `references/`.
* **C.** Move the 3GPP reference and the schema into the frontmatter description, so that they are available as soon as the session starts.
* **D.** Keep everything in `SKILL.md`, but shorten the headings and remove the examples to reduce the total size of the file.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Instructions belong in `SKILL.md`. Executable code goes in `scripts/` so that the assistant runs it instead of rewriting it, while schemas and long references load only when needed.
  * **Why Distractor A fails:** It breaks one workflow across several skills that must be triggered separately, and each one still loads its content in full.
  * **Why Distractor C fails:** The description is loaded for every session. Putting large content there makes every session heavier.
  * **Why Distractor D fails:** The whole file still loads at activation, and the script is still inline, so the assistant keeps rewriting it.

---

### **Question 3 (Domain 2 - Data Agent Kit)**

Network analysts work in VS Code with a coding assistant to build BigQuery transformations in dbt. The assistant guesses column names, so analysts paste table schemas into the chat by hand. They also want the assistant to run dbt models and check lineage without leaving the IDE.

**What should you do?**

* **A.** Install Data Agent Kit in the IDE, so that the assistant gets data skills and MCP tools for BigQuery and dbt.
* **B.** Write a custom skill that stores the current table schemas in `assets/` and includes a script that runs dbt commands.
* **C.** Configure MCP Toolbox for Databases with a BigQuery source, so that the assistant can query tables and read their schemas.
* **D.** Add a BigQuery connector to Gemini Enterprise, so that analysts can ask about table structures in the Gemini Enterprise app.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Data Agent Kit connects coding assistants to Google Data Cloud services, including BigQuery and dbt, with prebuilt skills and MCP tools. The assistant can inspect live schemas and run pipelines from the IDE.
  * **Why Distractor B fails:** Stored schemas become stale, and the team would maintain its own dbt tooling that already exists.
  * **Why Distractor C fails:** This covers querying tables, but not dbt execution, lineage, or data-engineering workflows.
  * **Why Distractor D fails:** It moves the work out of the IDE and does not help the assistant run dbt.

---

### **Question 4 (Domain 3 - Loading Skills in ADK Code)**

An engineer is building an incident-response agent in ADK and wants it to use an existing skill in `./skills/outage`, which contains `SKILL.md`, scripts, and references. The skill's content should load progressively, just as it does in a coding assistant, instead of being in the prompt all the time.

**What should you do?**

* **A.** Load the folder with `load_skill_from_dir(Path("./skills/outage"))` and pass the result to `SkillToolset(skills=[...])` in the agent's `tools`.
* **B.** Read `SKILL.md` when the agent starts and append its contents to the agent's `instruction`, so that the procedure is always available.
* **C.** Point an `McpToolset` with `stdio` connection parameters at the skill folder, so that its scripts are discovered as MCP tools.
* **D.** Create a sub-agent whose instruction is the text of `SKILL.md`, and attach it to the main agent through `AgentTool`.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** ADK loads a skill from its folder and exposes it through `SkillToolset`. The agent sees the metadata, loads the instructions when relevant, and pulls in resources on demand.
  * **Why Distractor B fails:** The whole procedure sits in the prompt on every turn, which defeats progressive disclosure, and the scripts and references are not exposed.
  * **Why Distractor C fails:** A skill folder is not an MCP server, so there is nothing for `McpToolset` to connect to.
  * **Why Distractor D fails:** It adds a model call and a separate agent, loses progressive loading of resources, and does not give access to the scripts.

---

### **Question 5 (Domain 3 - Context Isolation and Model Tiering)**

A network-analytics root agent runs on Gemini Pro and talks to engineers. It has 25 telemetry MCP tools, and their raw results, often thousands of rows, fill its context. Costs are high, and answer quality drops in long sessions. The team wants the telemetry analysis done by a cheaper model while the Pro agent keeps handling the conversation.

**What should you do?**

* **A.** Keep the 25 tools on the root agent and switch the root agent to Gemini Flash to lower the cost of each call.
* **B.** Apply `tool_filter` so that the root agent keeps only the five most-used telemetry tools and drops the rest.
* **C.** Move the 25 tools to a telemetry sub-agent that runs on Flash, wrap it in `AgentTool`, and attach it to the Pro root agent.
* **D.** Add a telemetry sub-agent on Flash to the root agent's `sub_agents`, so that the root agent can transfer telemetry questions to it.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** `AgentTool` runs the sub-agent in its own context and returns only its result. The raw telemetry stays out of the root agent's context, and each agent can use a different model.
  * **Why Distractor A fails:** It lowers the cost of each call, but the context stays bloated and the quality of the engineer-facing conversation drops.
  * **Why Distractor B fails:** It removes tools that engineers need, and the remaining tools' raw results still fill the root agent's context.
  * **Why Distractor D fails:** A transfer hands the conversation to the Flash agent, so engineers end up talking to the cheaper model, and the tool output still lands in the shared session history.
