Five scenario-based questions for **Scenario 13 (Clinical Trial Team Adopting Agents CLI)**.

---

### **Question 1 (Domain 2 - Injected Coding Assistant Skills)**

A clinical software team ran `uvx google-agents-cli setup`, which installed skills into their coding assistants. A developer asks the assistant to add a callback that blocks the `check_eligibility` tool whenever the patient consent flag in session state is missing. Before setup, the assistant invented ADK method names for this kind of task. The team wants to confirm which injected skill supplies the knowledge the assistant needs for this request.

**Which skill applies?**

* **A.** `google-agents-cli-workflow`
* **B.** `google-agents-cli-adk-code`
* **C.** `google-agents-cli-scaffold`
* **D.** `google-agents-cli-eval`

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** The ADK code skill carries the ADK Python API patterns for agents, tools, orchestration, callbacks, and state, which is exactly what writing a `before_tool_callback` requires.
  * **Why Distractor A fails:** The workflow skill guides the overall development lifecycle, code preservation, and model selection. It does not provide API-level callback patterns.
  * **Why Distractor C fails:** The scaffold skill covers creating, enhancing, and upgrading projects, not writing agent logic.
  * **Why Distractor D fails:** The eval skill covers datasets, metrics, and grading. It would help test the callback, not write it.

---

### **Question 2 (Domain 2 - Prototype-First Scaffolding)**

A data team has two days to show whether an agent can apply patient eligibility rules. Nobody has decided whether it will eventually run on Agent Runtime or Cloud Run, and the security team must review any cloud infrastructure before it is created. The team wants a standard project layout, including an evaluation dataset location, so that they can iterate locally right away.

**What should you do?**

* **A.** Run `agents-cli create eligibility-agent --prototype` and iterate locally.
* **B.** Run `agents-cli create eligibility-agent` with Agent Runtime as the target, then delete the Terraform and CI files.
* **C.** Create `app/agent.py` by hand in an empty folder and add `pyproject.toml` and the eval dataset later.
* **D.** Run `agents-cli scaffold enhance -d agent_runtime` in an empty folder to generate the project.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Prototype mode creates the standard project structure for local development without deciding on a deployment target or generating infrastructure. Infrastructure can be added later, after review.
  * **Why Distractor B fails:** It commits to a target before that decision has been made, and deleting generated files by hand is error-prone. It also produces infrastructure code before the security review.
  * **Why Distractor C fails:** It works, but it gives up the standard layout, manifest, and eval dataset that the CLI and its skills expect, which slows the team down.
  * **Why Distractor D fails:** `scaffold enhance` adds deployment infrastructure to an existing project. It is not meant to create a new project, and it would generate the infrastructure the team must avoid for now.

---

### **Question 3 (Domain 2 - Adding Deployment Infrastructure)**

The eligibility prototype passed its review. Developers have made substantial changes to `app/agent.py`, added tools, and extended the eval dataset. The team now needs a Dockerfile, Terraform, and a Cloud Build pipeline so that it can deploy to Cloud Run through CI/CD, and it must keep all existing work.

**What should you do?**

* **A.** Create a new project with `agents-cli create` targeting Cloud Run, then copy `app/agent.py` and the tools into it.
* **B.** Run `agents-cli deploy -d cloud_run` from the prototype and add Terraform and the CI pipeline after the first deployment succeeds.
* **C.** Ask the coding assistant to write a Dockerfile, Terraform modules, and a `cloudbuild.yaml` from scratch in the prototype folder.
* **D.** Run `agents-cli scaffold enhance -d cloud_run` in the prototype project to add the deployment infrastructure.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** `scaffold enhance` adds a Dockerfile, Terraform, and Cloud Build configuration for the chosen target to an existing project and keeps the agent code.
  * **Why Distractor A fails:** It works, but copying files by hand can miss changes, such as the extended eval dataset or dependency updates, and it is unnecessary.
  * **Why Distractor B fails:** It postpones the infrastructure-as-code and CI/CD that the team needs now, so the first production deployment would happen outside the pipeline.
  * **Why Distractor C fails:** Hand-writing infrastructure invites mistakes and inconsistency across teams. The CLI already generates tested templates for this.

---

### **Question 4 (Domain 2 - Local Testing Commands)**

A developer is refining a multi-turn consent conversation and wants to see each code change right away while chatting with the agent in a browser. Separately, the CI pipeline needs a fast smoke test that sends one prompt from the terminal and fails the build if the agent errors, before the full evaluation suite runs.

**What should you recommend?**

* **A.** Use `agents-cli run` for both, scripting the multi-turn conversation as a series of single-prompt calls.
* **B.** Use `agents-cli playground` for both, with CI sending HTTP requests to the playground server.
* **C.** Use `agents-cli playground` for the developer and `agents-cli run "prompt"` for the CI smoke test.
* **D.** Use `agents-cli eval run` for the developer and `agents-cli run "prompt"` for the CI smoke test.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** The playground is a local web interface with hot reloading, suited to interactive multi-turn testing. `run` sends a single prompt from the terminal, which is suited to a quick CI smoke test.
  * **Why Distractor A fails:** Separate `run` calls give up the interactive, hot-reloading experience the developer wants for refining the conversation.
  * **Why Distractor B fails:** The playground is an interactive development server. Starting it and scripting HTTP calls against it in CI adds complexity when `run` already does the job.
  * **Why Distractor D fails:** `eval run` executes and grades a dataset. It is not an interactive tool for refining a conversation.

---

### **Question 5 (Domain 2 - Project Layout and Manifest)**

To match their monorepo conventions, the team moved the agent code from `app/` to `src/eligibility/`. Importing the agent directly with Python still works, but `agents-cli playground` and `agents-cli deploy` now fail because they cannot find the agent.

**What should you do?**

* **A.** Update `agent_directory` in `agents-cli-manifest.yaml` to point to the new folder.
* **B.** Add the new folder as a package in `pyproject.toml` and run `uv sync` again.
* **C.** Add an environment variable to `.env` that points the CLI to the new agent path.
* **D.** Rename `root_agent` after the new folder so that the CLI can find it by convention.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The project manifest tells the CLI where the agent lives through `agent_directory`, which defaults to `app`. Updating it points every CLI command to the new location.
  * **Why Distractor B fails:** `pyproject.toml` manages dependencies and packaging. It does not tell the CLI which directory contains the agent.
  * **Why Distractor C fails:** `.env` holds local credentials and project settings. The CLI reads the agent location from the manifest.
  * **Why Distractor D fails:** The CLI expects the entry point to be named `root_agent`. Renaming it would break discovery instead of fixing it.
