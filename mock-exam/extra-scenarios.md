### **Scenario 11: Renewable Energy & Smart Grid Operations (Low-Code Agent Designer)**

**Context / Setup:** A global renewable energy enterprise manages wind and solar farms across multiple regions. The operations team is deploying a low-code virtual assistant using **Gemini Enterprise Agent Designer / CX Agent Studio** to assist field technicians with turbine troubleshooting, safety protocols, and warranty Q&A grounded in technical manuals.

---

### **Question 1 (Domain 1 - Low-Code)**

**Context:** A smart grid operations team is configuring the system instructions for a new low-code Agent Designer virtual assistant designed for wind turbine maintenance technicians. The assistant must adopt a professional engineering persona, answer turbine troubleshooting queries, enforce strict safety boundaries, and format all diagnostic steps in structured Markdown checklists.

**Goal:** Configure the assistant's system instructions following Google-recommended low-code prompt design patterns.

**Constraints:**
* Must be configured directly in Agent Designer system instructions using low-code prompt design best practices.
* Must require **no custom backend code or framework callbacks**.

**Which configuration approach should you select?**

* **A.** Structure the system prompt using clear Markdown headings defining `# Identity` (Senior Grid Operations Specialist), `# Scope & Boundaries` (refusing non-renewable energy queries), `# Methodology` (step-by-step diagnostic workflow), and `# Output Format` (Markdown bulleted action items).
* **B.** Write a custom Python `before_model_callback` function using the Agent Development Kit (ADK) to inspect incoming text strings and enforce persona boundaries via regex matching.
* **C.** Create a Model Armor template configured with Sensitive Data Protection (SDP) infotypes to filter wind turbine model numbers.
* **D.** Configure a Dialogflow CX Intent Route for every possible non-grid query topic and assign static fallback text responses.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Best practices for low-code Agent Designer / CX Agent Studio system instructions recommend using structured Markdown formatting with explicit headings. Defining `# Identity`, `# Mission`, `# Methodology`, `# Scope & Boundaries`, and `# Output Format` creates predictable, professional LLM behavior without writing custom backend code.
  * **Why Distractor B fails:** Writing a Python `before_model_callback` requires custom code execution in the Agent Development Kit (ADK), violating the low-code constraint.
  * **Why Distractor C fails:** Model Armor with SDP rules inspects and redacts PII/sensitive data; it does not set agent personas or scope boundaries in prompt instructions.
  * **Why Distractor D fails:** Building static intent routes for every out-of-scope topic is unmanageable and fails to leverage generative LLM capabilities.

---

### **Question 2 (Domain 1 - Low-Code)**

**Context:** Field technicians notice that when asking the Agent Designer assistant to extract turbine alert codes and severity ratings from raw diagnostic logs, the model occasionally outputs free-form conversational paragraphs rather than the required structured JSON payload needed by the maintenance ticketing API.

**Goal:** Guarantee reliable JSON output formatting for alert code extractions.

**Constraints:**
* Must use low-code prompt engineering techniques within the Agent Designer prompt interface.
* Must require **no custom webhook code or external parsing scripts**.

**Which approach should you implement?**

* **A.** Increase the model temperature parameter to `2.0` in the generation controls to force deterministic JSON output generation.
* **B.** Create a custom Python function tool wrapped with `FunctionTool.create()` to parse text strings at runtime.
* **C.** Attach an Agent Gateway in egress mode to convert plain text into JSON payloads over HTTP.
* **D.** Include 2-3 **few-shot examples** directly in the system prompt showing sample log input strings paired with the exact expected JSON output schema.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** **Few-shot prompting** (providing 2–3 explicit input \\(\rightarrow\\) output examples in the prompt) is the recommended low-code technique for fixing LLM output formatting issues and enforcing structured JSON responses without custom webhook code.
  * **Why Distractor A fails:** Increasing model temperature increases randomness and creativity, making output formatting *less* predictable.
  * **Why Distractor B fails:** Creating a custom Python function tool requires code development, violating the low-code constraint.
  * **Why Distractor C fails:** Agent Gateway is a network security policy proxy for traffic management and mTLS identity enforcement; it does not transform unstructured model text into JSON.

---

### **Question 3 (Domain 1 - Low-Code)**

**Context:** Field technicians report that when asking the low-code Agent Designer assistant to troubleshoot complex inverter voltage anomalies—which require checking ambient temperature, calculating phase variance, and verifying electrical isolation—the assistant jumps directly to a final recommendation and frequently misses critical safety isolation steps.

**Goal:** Improve the model's reasoning accuracy on complex multi-step diagnostics and prevent skipped safety checks.

**Constraints:**
* Must use low-code prompt engineering within Agent Designer.
* Must require **no multi-agent code orchestration or custom framework deployments**.

**Which prompt engineering technique should you apply?**

* **A.** Set `include_contents='none'` on the agent configuration to disable conversation history.
* **B.** Apply **Chain-of-Thought (CoT)** prompting instructions in the system prompt, explicitly commanding the model to step through its reasoning (`1. Analyze temperature logs`, `2. Calculate voltage phase variance`, `3. Verify isolation requirements`) before generating its final recommendation.
* **C.** Deploy an ADK `ParallelAgent` workflow in Cloud Run that executes 5 concurrent reasoning sub-agents.
* **D.** Configure a Dialogflow CX custom entity for every voltage level and set `max_digits=10`.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** **Chain-of-Thought (CoT) prompting** instructs the LLM to explicitly decompose complex problems into sequential reasoning steps before outputting a final answer. In low-code agent design, adding explicit step-by-step reasoning instructions prevents the model from skipping critical intermediate checks.
  * **Why Distractor A fails:** Setting `include_contents='none'` strips prior conversation context, which degrades reasoning quality in multi-turn troubleshooting.
  * **Why Distractor C fails:** Deploying an ADK `ParallelAgent` on Cloud Run requires writing Python code and managing cloud infrastructure, violating the low-code requirement.
  * **Why Distractor D fails:** Custom entities extract parameter slots in conversational flows; `max_digits` is a DTMF telephony setting for keypad input and does not improve LLM multi-step reasoning.

---

### **Question 4 (Domain 1 - Low-Code)**

**Context:** A low-code agent built in Agent Designer / CX Agent Studio needs to personalize response messages and tool queries dynamically using session variables collected during dialogue (such as the active `{session.params.substation_id}` and `{session.params.technician_tier}`).

**Goal:** Dynamically inject session parameters into system prompts and fulfillment response templates.

**Constraints:**
* Must use the native low-code session parameter templating syntax.
* Must require **no custom webhook code**.

**Which syntax should you use in the prompt template?**

* **A.** Reference the session parameters directly in the prompt/fulfillment template using the `{session.params.variable_name}` (or `$session.params.variable_name`) placeholder syntax.
* **B.** Hardcode the substation ID as a static string inside the system instruction file and re-save the prompt for each technician.
* **C.** Pass session parameters as base64-encoded URL parameters in an Agent Gateway mTLS header.
* **D.** Use ADK's `temp:` state prefix inside a custom Python `_run_async_impl` override function.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** In Conversational Agents / Agent Designer, session variables are dynamically injected into prompts and fulfillment messages using the `{session.params.variable_name}` or `$session.params.variable_name` placeholder syntax. The platform automatically replaces these placeholders with active runtime session parameter values before sending the prompt to the model.
  * **Why Distractor B fails:** Hardcoding static strings prevents dynamic personalization and requires manual re-authoring for every technician.
  * **Why Distractor C fails:** Agent Gateway headers enforce network security policies; they are not used for in-prompt conversational parameter templating.
  * **Why Distractor D fails:** Overriding `_run_async_impl` is a code-first ADK custom agent pattern, not a low-code prompt template placeholder.

---

### **Question 5 (Domain 1 - Low-Code)**

**Context:** A renewable energy enterprise wants to build a new portal where solar customers can ask questions about billing, warranty terms, and net metering policies sourced from PDF user guides and policy documents.

**Goal:** Select the development platform according to Google Cloud recommended architectural guidelines.

**Constraints:**
* Must minimize custom code development and operational maintenance overhead.
* Requires rapid time-to-market using visual workflow building, out-of-the-box data store connectors, and pre-built web chat widget integrations.

**Which solution should you recommend?**

* **A.** Build a custom multi-agent system from scratch using Python ADK with `BaseAgent` overrides and self-hosted MCP servers on GKE.
* **B.** Develop a custom C++ application using direct gRPC calls to the Gemini API and manual vector distance math.
* **C.** Select **Agent Designer / CX Agent Studio (Conversational Agents)** with generative Data Store Handlers to visually design the agent, ingest PDF guides into a Data Store, and deploy using pre-built web chat integrations.
* **D.** Deploy an ADK `LoopAgent` with custom `before_tool_callback` handlers to manually parse PDF documents line by line.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** For enterprise Q&A virtual agents grounded in document repositories, Google Cloud recommends **Agent Designer / CX Agent Studio (Conversational Agents)**. It provides a low-code visual interface, managed Data Store Handlers for RAG over unstructured PDFs, and out-of-the-box UI integrations (such as Dialogflow CX Messenger) with zero custom code.
  * **Why Distractor A fails:** Building custom ADK agents with `BaseAgent` overrides and self-hosted GKE MCP servers introduces high custom code development and infrastructure management overhead.
  * **Why Distractor B fails:** Writing a C++ gRPC application from scratch requires extreme development effort and reinvents built-in platform capabilities.
  * **Why Distractor D fails:** Writing manual PDF line-parsing callbacks in an ADK `LoopAgent` adds unnecessary code complexity for a standard document RAG use case.

---

### **Scenario 12: Commercial Aviation Maintenance & Fleet Operations (Dialogflow CX & Multimodal Data Stores)**

**Context / Setup:** A global commercial airline manages maintenance and fleet operations across international airport hubs. The engineering organization is building a conversational virtual assistant using **Dialogflow CX (Conversational Agents)** and **Agent Search** to assist hangar technicians with maintenance logs, diagnostic troubleshooting, and parts inventory lookups.

---

### **Question 1 (Domain 1 - Low-Code)**

**Context:** The airline’s IT department has three distinct engineering teams managing different operational domains: `Engine Maintenance`, `Avionics Systems`, and `Cabin Safety`. Each team is responsible for developing, testing, and maintaining its own conversational sub-domain for the fleet assistant.

**Goal:** Architecture the Dialogflow CX agent so that teams can build and modify their respective dialogue domains independently without risk of breaking other teams' state pages or conversational logic.

**Constraints:**
* Must use native Dialogflow CX structural components designed for modularity and team isolation.
* Must avoid building a single monolithic state diagram where all pages reside in the Default Start Flow.

**Which architectural design should you recommend?**

* **A.** Put all pages into a single `Default Start Flow` and use Custom Entities to prefix page names by team (e.g., `engine_page1`, `avionics_page1`).
* **B.** Create separate GCP projects for each team and connect them using local `stdio` Model Context Protocol (MCP) servers.
* **C.** Deploy an ADK `ParallelAgent` in Python that imports three separate `.json` file scripts at runtime.
* **D.** Partition the agent into distinct **Flows** (`EngineMaintenanceFlow`, `AvionicsFlow`, `CabinSafetyFlow`), allowing each team to independently own and manage its assigned flow topic.

#### **Answer & Explanation**
* **Correct Answer: D**
* **Why it's correct:** In Dialogflow CX, **Flows** represent high-level, modular topics or sub-agent domains. Splitting a complex agent into separate flows allows independent development teams to build, test, and deploy their assigned sub-domain logic in isolation without risking collisions in state pages or transition routes.
* **Why Distractor A fails:** Placing all pages in a single start flow creates a monolithic state machine that is difficult to maintain and leads to merge conflicts across engineering teams.
* **Why Distractor B fails:** Local `stdio` MCP servers execute on local developer machines and cannot serve as cross-project network connectors for Dialogflow CX agents.
* **Why Distractor C fails:** Using Python ADK code violates the low-code platform approach and replaces built-in Dialogflow CX visual flow management.

---

### **Question 2 (Domain 1 - Low-Code)**

**Context:** Inside the `EngineMaintenanceFlow`, a technician is on the active `InspectCompressor` page. The agent needs to transition to the `ReplaceTurbineBlade` page if the recorded damage score exceeds a critical threshold (`$session.params.damage_score > 7`). Alternatively, if the technician explicitly says "compressor looks clean", the agent should transition to the `RoutineSignoff` page.

**Goal:** Configure the state transition logic on the `InspectCompressor` page to handle both the data-driven threshold check and the user's conversational intent.

**Constraints:**
* Must use native Dialogflow CX state handler types appropriate for each trigger mechanism.

**Which transition route configuration should you apply?**

* **A.** Add a **Condition Route** checking `$session.params.damage_score > 7` to handle the parameter evaluation, and an **Intent Route** matching the user intent `inspection.compressor_clean` to handle the spoken phrase.
* **B.** Add two Intent Routes and use an external Python Cloud Function to evaluate `$session.params.damage_score` inside a regex statement.
* **C.** Configure a Model Armor template in `Inspect and block` mode to inspect `$session.params.damage_score`.
* **D.** Add an Event Handler for `sys.no-match` that parses damage score strings using a System Entity.

#### **Answer & Explanation**
* **Correct Answer: A**
* **Why it's correct:** Dialogflow CX uses two primary state transition route types: **Condition Routes** (which evaluate boolean logic over session parameters or webhook outputs, such as `$session.params.damage_score > 7`) and **Intent Routes** (which trigger when the NLU matches a trained user intent, such as `inspection.compressor_clean`).
* **Why Distractor B fails:** Using a custom Cloud Function webhook to evaluate basic parameter boolean conditions adds unnecessary latency and ignores built-in Condition Routes.
* **Why Distractor C fails:** Model Armor is an inline security sanitization proxy for PII and prompt injection; it does not handle state transitions in Dialogflow CX pages.
* **Why Distractor D fails:** `sys.no-match` event handlers trigger when user input cannot be matched to an intent, not when evaluating boolean parameter conditions.

---

### **Question 3 (Domain 1 - Low-Code)**

**Context:** Technicians interact with the fleet assistant in noisy aircraft hangars. Audio inputs are frequently garbled or cut off by ambient engine noise, network glitches occasionally cause inventory webhook lookups to fail, and long pauses occur while technicians inspect parts.

**Goal:** Prevent the agent from dropping sessions or outputting raw system stack traces when input or network disruptions occur.

**Constraints:**
* Must use built-in Dialogflow CX event handling mechanisms on pages and flows.
* Must provide graceful reprompts or fallback fulfillment messages.

**Which feature should you configure?**

* **A.** Enable `ALLOW_UNAUTHENTICATED` access on the Dialogflow CX fulfillment Webhook URL.
* **B.** Add a system instruction in prompt settings stating: *"Ignore all ambient noise and network timeouts."*
* **C.** Configure built-in **Event Handlers** for `sys.no-input` (handling silence), `sys.no-match` (handling unrecognized speech), and `sys.webhook-error` (handling API failures) with custom reprompts or fallback actions.
* **D.** Deploy an Agent Gateway in egress mode to catch gRPC socket exceptions.

#### **Answer & Explanation**
* **Correct Answer: C**
* **Why it's correct:** Dialogflow CX provides **Event Handlers** to manage unexpected conversational or system disruptions gracefully. Setting up event handlers for built-in events (`sys.no-input`, `sys.no-match`, `sys.webhook-error`) allows the agent to deliver helpful reprompts, execute fallback routes, or recover from failed API webhooks without crashing the conversation.
* **Why Distractor A fails:** Enabling unauthenticated access on webhooks creates a security vulnerability and does not handle conversational `no-match` or `no-input` events.
* **Why Distractor B fails:** System instructions inside generative prompts cannot intercept system-level webhooks or handle audio silence events.
* **Why Distractor C fails:** Agent Gateway manages network policies and SPIFFE identities; it does not catch or handle conversational `no-input` or `no-match` events inside Dialogflow CX.

---

### **Question 4 (Domain 1 - Low-Code)**

**Context:** The maintenance engineering department needs to index a massive multimodal repository into an Enterprise Data Store connected to the virtual assistant. The data assets include high-resolution images of engine wear, scanned paper historical maintenance logs, and recorded cockpit voice audio files.

**Goal:** Configure data store ingestion to enable generative Q&A and semantic search across these assets.

**Constraints:**
* Must avoid building custom external OCR pipelines or third-party speech-to-text pre-processing jobs.
* Must leverage native Google Cloud multimodal data store ingestion capabilities.

**Which ingestion architecture should you implement?**

* **A.** Convert all scanned PDFs and images into plain text files using a custom Python script before uploading them to Cloud Storage.
* **B.** Ingest the raw image files, scanned paper PDFs, and audio recordings directly into the **Agent Search / Enterprise Data Store**, leveraging native Gemini multimodal processing models to extract visual, textual, and audio features automatically.
* **C.** Store audio files as base64 strings inside a Dialogflow CX Custom Entity table.
* **D.** Deploy an ADK `LoopAgent` that executes `pdftotext` CLI commands in Cloud Shell.

#### **Answer & Explanation**
* **Correct Answer: B**
* **Why it's correct:** Agent Search and Enterprise Data Stores natively leverage Gemini multimodal capabilities. They ingest unstructured multimodal assets—including images, scanned PDF documents, and audio recordings—directly without requiring external OCR or speech-to-text pre-processing pipelines.
* **Why Distractor A fails:** Pre-processing images through text scripts discards visual features (such as crack patterns or structural fatigue visible in images) that native multimodal models process directly.
* **Why Distractor C fails:** Base64 audio strings in custom entities exceed entity length limits and do not enable vector similarity search or multimodal understanding.
* **Why Distractor D fails:** Running CLI scripts in Cloud Shell is not a scalable enterprise data ingestion pipeline for generative data stores.

---

### **Question 5 (Domain 1 - Low-Code)**

**Context:** When a technician speaks to the assistant (e.g., *"Check inventory for part number A320-884-X installed on October 12th"*), the active page must extract structured parameters (`part_number`, `installation_date`) to populate form slots before triggering an inventory lookup webhook.

**Goal:** Configure the active Dialogflow CX page to extract these structured parameter values automatically from natural language input.

**Constraints:**
* Must use built-in form parameter prefilling mechanisms within Dialogflow CX.
* Must require **no custom backend code or regex parsing scripts**.

**Which configuration should you apply on the Page?**

* **A.** Define **Form Parameters** on the Page, mapping `part_number` to a Custom Entity (or regex pattern) and `installation_date` to the System Entity `@sys.date-time`, configuring required parameter prompts if slots are missing.
* **B.** Configure an ADK `before_tool_callback` in Python to parse input strings using string split functions.
* **C.** Attach a Model Armor template with Advanced Sensitive Data Protection (SDP) rules to extract dates.
* **D.** Set `max_iterations=10` on the page transition route.

#### **Answer & Explanation**
* **Correct Answer: A**
* **Why it's correct:** Dialogflow CX pages use **Form Parameters** to collect structured slot values from user input. By assigning System Entities (like `@sys.date-time`) or Custom Entities to form parameters, the page automatically extracts structured values from conversational turns and prompts the user for any missing required fields before triggering webhooks.
* **Why Distractor B fails:** Writing a custom Python callback requires code development, violating the low-code requirement.
* **Why Distractor C fails:** Model Armor SDP rules redact and mask PII; they are not used to populate Dialogflow CX form parameter slots for webhooks.
* **Why Distractor D fails:** `max_iterations` is an ADK loop workflow parameter, not a Dialogflow CX form parameter extraction setting.

---
### **Scenario 13: Biotech & Pharmaceutical Clinical Trial Operations (Team Adopting `agents-cli`)**

**Context / Setup:** A global bio-pharmaceutical research enterprise manages clinical trial protocols across international study sites. The software engineering department is adopting the **Agents CLI (`agents-cli`)** toolchain to standardize how developers build, test, evaluate, and deploy Agent Development Kit (ADK) applications across local IDEs (such as VS Code, Cursor, and Antigravity) and Google Cloud.

---

### **Question 1 (Domain 2 - Coding Agents & `agents-cli`)**

**Context:** A team of clinical software engineers is setting up their local development environment for building ADK-based clinical trial monitoring agents. They execute `uvx google-agents-cli setup` in their terminal to initialize the toolchain and register context-aware developer skills with their AI coding assistants. One developer needs their coding assistant to inject ADK Python API design patterns, tool declarations, multi-agent orchestration, and callback handlers into their IDE workspace.

**Goal:** Identify the specific injected skill that equips the coding assistant with ADK Python coding patterns and API designs.

**Which injected skill satisfies this requirement?**

* **A.** `google-agents-cli-deploy`
* **B.** `google-agents-cli-adk-code`
* **C.** `google-agents-cli-publish`
* **D.** `google-agents-cli-observability`

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Running `uvx google-agents-cli setup` installs the CLI and injects 7 specialized skills into detected coding environments. The **`google-agents-cli-adk-code`** skill specifically injects ADK Python API design patterns, tool implementation guidance, orchestration structures, and callback handlers directly into the coding assistant's context.
  * **Why Distractor A fails:** `google-agents-cli-deploy` guides target deployment configurations (Agent Runtime, Cloud Run, GKE, CI/CD), not Python ADK code and tool design.
  * **Why Distractor C fails:** `google-agents-cli-publish` manages registering deployed Agent Runtime instances with Gemini Enterprise Agent Registry.
  * **Why Distractor D fails:** `google-agents-cli-observability` configures Cloud Trace, Cloud Logging, and OpenTelemetry instrumentation.

---

### **Question 2 (Domain 2 - Coding Agents & `agents-cli`)**

**Context:** Clinical data engineers want to rapidly create a lightweight, local proof-of-concept ADK agent to validate patient eligibility rules. They want to scaffold a new project workspace immediately without generating production Terraform Infrastructure-as-Code (IaC) files, Dockerfiles, or committing cloud deployment resources upfront.

**Goal:** Select the `agents-cli` initialization command to scaffold a local prototype project.

**Constraints:**
* Must create a functional ADK project layout optimized for quick local iteration.
* Must omit heavy cloud deployment infrastructure files during initial creation.

**Which command should you execute?**

* **A.** `agents-cli create clinical-trial-agent --prototype`
* **B.** `agents-cli deploy --target gke --prod`
* **C.** `agents-cli eval run --dataset local.json`
* **D.** `agents-cli scaffold enhance --d cloud_run`

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Executing **`agents-cli create <project-name> --prototype`** scaffolds a lightweight prototype workspace. It provides the minimal file structure required for local ADK agent development without generating production cloud deployment artifacts like Terraform IaC or Dockerfiles upfront.
  * **Why Distractor B fails:** `agents-cli deploy` builds and deploys container images to cloud targets; it does not scaffold new local projects.
  * **Why Distractor C fails:** `agents-cli eval run` executes evaluation datasets against existing agent endpoints; it does not scaffold projects.
  * **Why Distractor D fails:** `agents-cli scaffold enhance` injects infrastructure configurations into an *existing* prototype project rather than creating a new project.

---

### **Question 3 (Domain 3 - Coding Agents & `agents-cli`)**

**Context:** The clinical trial eligibility prototype has passed initial local validation tests. The engineering team is now ready to prepare the project for production containerization and deployment to Cloud Run, including injecting Dockerfiles and Terraform IaC configurations into the existing project directory.

**Goal:** Add production infrastructure and deployment assets to the existing prototype project.

**Constraints:**
* Must enhance the current prototype directory without recreating the project from scratch or overwriting custom Python agent code in `app/agent.py`.

**Which command should you execute?**

* **A.** `agents-cli create clinical-trial-agent --overwrite`
* **B.** `uvx google-agents-cli setup --reset`
* **C.** `agents-cli playground --docker`
* **D.** `agents-cli scaffold enhance -d cloud_run`

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** **`agents-cli scaffold enhance -d cloud_run`** takes an existing local prototype project and injects the required production infrastructure assets—including Dockerfiles, Terraform IaC, and Cloud Build CI/CD configs—tailored to the target runtime (Cloud Run) while preserving existing Python code.
  * **Why Distractor A fails:** Re-running `create` with `--overwrite` wipes out custom Python agent logic previously written in `app/agent.py`.
  * **Why Distractor B fails:** Re-running `setup` re-installs CLI binaries and IDE skills; it does not add Dockerfiles or Terraform files to a project.
  * **Why Distractor C fails:** `agents-cli playground` launches an interactive local web interface; it does not accept a `--docker` flag to enhance project infrastructure.

---

### **Question 4 (Domain 2 - Coding Agents & `agents-cli`)**

**Context:** A developer on the team needs to test multi-turn conversations with the clinical agent in a local browser interface featuring hot-reloading so that code edits in `app/agent.py` take effect immediately. Meanwhile, a CI script needs to test single prompt-response pairs directly from the terminal.

**Goal:** Select the appropriate CLI commands for (1) interactive browser testing with hot-reloading and (2) single terminal prompt execution.

**Which command combination should you recommend?**

* **A.** Use `agents-cli deploy` for interactive browser testing, and `agents-cli setup` for terminal execution.
* **B.** Use `agents-cli eval grade` for interactive browser testing, and `agents-cli publish` for terminal execution.
* **C.** Use **`agents-cli playground`** for interactive browser testing with hot-reloading, and **`agents-cli run "prompt"`** for single terminal prompt execution.
* **D.** Use `agents-cli scaffold` for interactive browser testing, and `agents-cli create` for terminal execution.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** **`agents-cli playground`** launches an interactive local web UI (typically at `http://localhost:8080`) with active hot-reloading for testing multi-turn sessions. For non-interactive single-prompt execution from the command line, developers execute **`agents-cli run "user prompt"`**.
  * **Why Distractor A fails:** `deploy` pushes containers to cloud targets, and `setup` installs CLI environment skills.
  * **Why Distractor B fails:** `eval grade` scores evaluation dataset traces, and `publish` registers agents with Agent Registry.
  * **Why Distractor D fails:** `scaffold` and `create` are project initialization commands, not runtime testing utilities.

---

### **Question 5 (Domain 2 - Coding Agents & `agents-cli`)**

**Context:** A new software engineer joins the team and asks where key project assets are located within the standardized file structure created by `agents-cli create`.

**Goal:** Map the standard `agents-cli` project layout components to their correct functional roles.

**Which directory and file layout mapping is correct?**

* **A.** **`app/agent.py`** defines the root agent instance (`root_agent = ...`), tools, and system instructions; **`agents-cli-manifest.yaml`** stores project metadata and deployment target settings; **`tests/eval/datasets/`** contains baseline evaluation datasets.
* **B.** **`agents-cli-manifest.yaml`** holds Python code; **`app/agent.py`** holds Terraform IaC files; **`Dockerfile`** holds evaluation test datasets.
* **C.** **`tests/eval/datasets/`** stores mTLS certificates; **`app/agent.py`** stores user passwords; **`.env`** holds public documentation links.
* **D.** **`app/agent.py`** is an auto-generated Docker script; **`agents-cli-manifest.yaml`** is an uncompiled C++ file.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Standard `agents-cli` project conventions dictate:
    * `app/agent.py`: The primary Python application entry point defining `root_agent`, prompt instructions, and tool bindings.
    * `agents-cli-manifest.yaml`: Project manifest containing metadata, directory paths, and default deployment target settings.
    * `tests/eval/datasets/`: Workspace containing benchmark JSON datasets for automated testing.
  * **Why Distractor B fails:** Reverses file roles completely; `manifest.yaml` is YAML metadata, not Python application code.
  * **Why Distractor C fails:** Test dataset directories hold benchmark JSON cases, not mTLS certificates; `agent.py` contains Python application logic, not user passwords.
  * **Why Distractor D fails:** `app/agent.py` is Python source code, not a Docker script or C++ binary.

---

### **Scenario 14: Automotive Smart Manufacturing & Supply Chain Operations (Exposing Systems via MCP)**

**Context / Setup:** An international automotive manufacturer operates smart assembly plants and supplier logistics networks. The engineering organization is connecting internal ERP systems, assembly line databases, and inventory services to AI coding assistants and ADK agents using the **Model Context Protocol (MCP)**.

---

### **Question 1 (Domain 2 - Coding Agents & MCP)**

**Context:** A data engineering team is setting up MCP connections for their developers. Software developers use coding assistants locally on their workstations to test database queries against local dockerized databases, while production agents run as containerized microservices on Cloud Run connecting to remote cloud databases.

**Goal:** Select the appropriate MCP transport protocol for each operational environment.

**Constraints:**
* Must choose the correct MCP transport mechanism according to environment requirements.
* Local developer CLI testing must use local subprocess execution, whereas remote Cloud Run services require network HTTP/HTTPS connections.

**Which transport mechanism configuration should you recommend?**

* **A.** Use **Standard I/O (`stdio`)** transport for local desktop CLI testing and subprocesses, and **Streamable HTTP** (or SSE) transport for remote cloud container execution on Cloud Run.
* **B.** Use Standard I/O (`stdio`) transport for remote Cloud Run containers, and Streamable HTTP for local desktop subprocesses.
* **C.** Use gRPC over local sockets for Cloud Run, and base64 text files for local CLI testing.
* **D.** Use Dialogflow CX webhook transport for both local desktop testing and remote Cloud Run containers.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The Model Context Protocol (MCP) defines two primary transport mechanisms:
    1. **Standard I/O (`stdio`)**: Used for local subprocesses running on a single machine (e.g., local developer CLI testing or IDE extensions calling local npm/npx packages).
    2. **Streamable HTTP / Server-Sent Events (SSE)**: Used for remote cloud services over network connections (HTTP/HTTPS), essential for stateless container runtimes like Cloud Run or GKE that support bearer token authentication and horizontal scaling.
  * **Why Distractor B fails:** Reverses the environments; `stdio` cannot establish network connections to Cloud Run containers across the network.
  * **Why Distractor C fails:** Base64 text files are not a valid MCP transport mechanism.
  * **Why Distractor D fails:** Dialogflow CX webhooks are conversational fulfillment integration endpoints, not MCP transport layers.

---

### **Question 2 (Domain 2 - Coding Agents & MCP)**

**Context:** The automotive manufacturer needs to enable ADK agents to execute telemetry queries across multiple operational databases (Cloud SQL, Spanner, and AlloyDB) without building custom driver integration code for every database engine.

**Goal:** Deploy a containerized database tool server using Google's open-source database tool ecosystem.

**Which component should you deploy to Cloud Run?**

* **A.** Deploy a custom C++ application that compiles SQL queries into binary executables.
* **B.** Deploy an Agent Gateway proxy with IAM authentication disabled across all GCP projects.
* **C.** Deploy the open-source **MCP Toolbox for Databases** server on Cloud Run to manage database connection pooling and expose standardized MCP tools across AlloyDB, Cloud SQL, and Spanner within a private VPC.
* **D.** Deploy Vertex AI Vector Search and store database connection strings in local `.env` files.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** **MCP Toolbox for Databases** is an open-source MCP server provided by Google Cloud. Deployed as a containerized service on Cloud Run inside a private VPC, it manages connection pooling and exposes standardized MCP tools for querying across 16+ database engines (including AlloyDB, Spanner, and Cloud SQL) without custom database driver code.
  * **Why Distractor A fails:** Compiling SQL queries into C++ binaries introduces unnecessary development complexity and fails to use standard MCP tool protocols.
  * **Why Distractor B fails:** Agent Gateway is a network policy enforcement proxy, and disabling IAM authentication violates security baselines.
  * **Why Distractor C fails:** Vertex AI Vector Search is a vector embedding index for semantic search, not a database tool proxy for relational/transactional databases.

---

### **Question 3 (Domain 2 - Coding Agents & MCP)**

**Context:** When deploying a self-hosted MCP Toolbox for Databases server on Cloud Run, developers need to supply database passwords and connection secrets securely.

**Goal:** Configure credential management for the Cloud Run MCP server according to Google-recommended security best practices.

**Constraints:**
* Must prevent hardcoding secrets in container images or source code repositories.
* Must enforce IAM access controls on credential retrieval.

**Which configuration should you implement?**

* **A.** Hardcode database passwords as plaintext strings inside the application Dockerfile.
* **B.** Embed database passwords in system prompt instructions as a few-shot example.
* **C.** Store credentials in a public Cloud Storage bucket and read them via unencrypted HTTP GET requests during execution.
* **D.** Store database credentials in **Secret Manager**, grant the Cloud Run service account the Secret Manager Secret Accessor role (`roles/secretmanager.secretAccessor`), and mount the secrets as environment variables or volume mounts in Cloud Run.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Google Cloud security best practices mandate storing sensitive credentials in **Secret Manager**. Granting the Cloud Run runtime service account `roles/secretmanager.secretAccessor` allows the container to dynamically fetch or mount database secrets at startup without exposing plaintext keys in code, Dockerfiles, or system prompts.
  * **Why Distractor A fails:** Hardcoding plaintext secrets in Dockerfiles exposes passwords to anyone with access to the container image or image registry.
  * **Why Distractor B fails:** Embedding credentials in prompt instructions exposes raw secrets in prompt memory, increases token consumption, and risks data leakage.
  * **Why Distractor C fails:** Storing secrets in public Cloud Storage buckets over HTTP allows unauthorized public access and exposes credentials in cleartext over the network.

---

### **Question 4 (Domain 2 - Coding Agents & MCP)**

**Context:** A specialized assembly-line monitoring agent connects to a remote MCP server that exposes 30 different plant management tools. To enforce the principle of least privilege and prevent prompt context bloat, the agent must only be granted access to 3 specific tools: `check_assembly_line`, `get_part_status`, and `report_fault`.

**Goal:** Restrict the MCP tools exposed to the agent in ADK code.

**Constraints:**
* Must enforce tool access limits at the application code layer without modifying the underlying remote MCP server source code.

**Which configuration should you apply in ADK?**

* **A.** Delete the remaining 27 tools directly from the remote MCP server source code repository.
* **B.** Pass a **`tool_filter`** allowlist parameter to `McpToolset` in ADK containing only the required tool names (`tool_filter=["check_assembly_line", "get_part_status", "report_fault"]`).
* **C.** Configure a Model Armor template with `Inspect and block` mode set to drop all tool schemas.
* **D.** Wrap the agent in a `ParallelAgent` and set `max_iterations=30`.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** In ADK, `McpToolset` accepts a **`tool_filter`** allowlist array. Providing a specific list of tool names ensures the agent only loads and exposes those specific tool schemas in its context window, adhering to the principle of least privilege and preventing context window bloat.
  * **Why Distractor A fails:** Modifying the shared remote MCP server source code breaks tool availability for other agents that rely on the remaining 27 tools.
  * **Why Distractor C fails:** Model Armor filters prompt injection and PII; it does not selectively filter MCP tool schema definitions in ADK code.
  * **Why Distractor D fails:** `ParallelAgent` handles concurrent sub-agent workflows; `max_iterations` is a `LoopAgent` parameter, and neither restricts MCP tool filters.

---

### **Question 5 (Domain 2 - Coding Agents & MCP)**

**Context:** An engineering team has developed an autonomous supply chain risk analysis agent in Python using ADK. Other external applications, IDE coding assistants, and remote systems need to invoke this autonomous agent as if it were a tool exposed by a standard MCP server.

**Goal:** Expose the existing ADK agent application as an MCP server endpoint.

**Which utility function should you use in ADK?**

* **A.** `agents-cli deploy --mcp-only`
* **B.** `DialogflowCX.export_to_mcp()`
* **C.** `ModelArmor.to_mcp_proxy()`
* **D.** Expose the agent using ADK's **`to_mcp_server`** utility function, converting the ADK agent instance into a standard MCP server protocol endpoint.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** ADK provides the **`to_mcp_server`** utility function. It wraps an existing ADK agent instance and exposes its capabilities as a standard Model Context Protocol (MCP) server endpoint, enabling external MCP clients (such as IDEs, Claude Code, or other agents) to invoke the ADK agent as a tool.
  * **Why Distractor A fails:** `agents-cli deploy` deploys agent containers to targets like Cloud Run or GKE; it does not accept a `--mcp-only` flag to compile code into an MCP server.
  * **Why Distractor B fails:** `DialogflowCX.export_to_mcp()` is a fabricated class method; Dialogflow CX does not provide native python exports to MCP servers.
  * **Why Distractor C fails:** Model Armor is a security sanitization framework, not an application wrapper for compiling agents into MCP servers.

---

### **Scenario 15: Telecommunications Network Analytics & Fiber Operations (Agent Skills + Data Agent Kit)**

**Context / Setup:** A major telecommunications provider operates national fiber-optic and 5G wireless networks. The data engineering team is equipping AI coding assistants and ADK-based network analytics agents with **Agent Skills** and the **Data Agent Kit (DAK)** to query BigQuery network logs, manage dbt transformation models, and execute analytical workflows across millions of cell tower events.

---

### **Question 1 (Domain 2 - Coding Agents & Agent Skills)**

**Context:** The telecom data engineering team is creating custom Agent Skills to guide coding assistants through standardized 5G network performance analysis. To prevent bloating prompt context windows when an assistant scans available skills, skills use progressive disclosure across three loading tiers: L1 (metadata), L2 (core instructions), and L3 (extended assets/scripts).

**Goal:** Understand what information is loaded at Level 1 (L1) during initial skill discovery.

**Constraints:**
* Must follow the official Agent Skills progressive disclosure specification.
* Level 1 must expose minimal metadata so the assistant can decide whether to activate the skill without loading full execution scripts.

**Which information is loaded at Level 1 (L1)?**

* **A.** The complete Python execution scripts located in `scripts/` and full reference documentation in `references/`.
* **B.** The entire `SKILL.md` file contents, including all step-by-step instructions and example code blocks.
* **C.** The project's Terraform IaC files and Dockerfile configurations.
* **D.** Only the skill name and description metadata from `SKILL.md`, allowing the model to determine relevance before loading further instructions.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Agent Skills use a 3-tier progressive disclosure pattern to optimize context window efficiency:
    * **L1 (Discovery)**: Only the skill **name and description** metadata from `SKILL.md` are loaded into system instructions so the model knows what capabilities exist.
    * **L2 (Activation)**: The full `SKILL.md` instruction file is loaded when the model determines the skill is relevant to the active task.
    * **L3 (Execution)**: Specific resource files, execution scripts (`scripts/`), and reference documents (`references/`) are loaded on-demand during execution.
  * **Why Distractor A fails:** Loading full execution scripts and reference docs occurs at Level 3 (L3) on-demand, not during initial L1 discovery.
  * **Why Distractor B fails:** Loading the entire `SKILL.md` instruction text occurs at Level 2 (L2) upon skill activation, not at Level 1.
  * **Why Distractor C fails:** Terraform IaC files and Dockerfiles are deployment infrastructure assets managed by `agents-cli`, not L1 skill discovery metadata.

---

### **Question 2 (Domain 2 - Coding Agents & Agent Skills)**

**Context:** A telecom data engineer is organizing a complex Agent Skill for analyzing 5G tower outages. The skill includes step-by-step guidance in `SKILL.md`, reusable Python data-parsing scripts, static network topology diagrams, and long-form reference documentation for 3GPP protocols.

**Goal:** Structure the skill directory following the standardized Agent Skill folder conventions.

**Which directory structure correctly maps these supporting assets?**

* **A.** Put all Python scripts into `SKILL.md` and upload images to a Dialogflow CX Custom Entity table.
* **B.** Store execution scripts in **`scripts/`**, supporting templates/visual assets in **`assets/`**, and detailed background documentation in **`references/`**, all alongside `SKILL.md`.
* **C.** Place all files into the root `/tmp/` directory of the local developer workstation without sub-folders.
* **D.** Store Python scripts in `manifest.yaml` and reference documents in `Dockerfile`.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** The standard Agent Skill directory layout defines clear subdirectories alongside `SKILL.md`:
    * `scripts/`: Executable scripts (Python, bash) that the agent or coding assistant can run.
    * `assets/`: Static resources, visual assets, templates, or schemas.
    * `references/`: Extended background documentation and technical references read on-demand (L3).
  * **Why Distractor A fails:** Embedding raw executable scripts inside `SKILL.md` bloats the instruction text and prevents native script execution; Dialogflow CX custom entities are for conversational chatbot parameters.
  * **Why Distractor C fails:** Dumping all files unorganized into `/tmp/` breaks the Agent Skills specification and prevents IDEs and frameworks from discovering skill assets.
  * **Why Distractor D fails:** `manifest.yaml` is a YAML configuration file, and `Dockerfile` contains container build steps; neither is used to organize skill source code or reference documents.

---

### **Question 3 (Domain 2 - Coding Agents & Data Agent Kit)**

**Context:** Telecom data analysts use VS Code and Cursor IDEs to manage large-scale network telemetry transformations across BigQuery and dbt (data build tool). They want to equip their IDE coding assistants with natural language capabilities to inspect BigQuery table schemas, generate optimized SQL queries, and execute dbt lineage models directly from the IDE.

**Goal:** Select the specialized plugin and skill suite built specifically for Google Data Cloud and dbt workflows in the IDE.

**Which tool suite should you integrate?**

* **A.** Configure the **Data Agent Kit (DAK)** plugin in the IDE environment to bridge coding assistants directly to BigQuery and dbt tools via standard data skills and MCP servers.
* **B.** Export BigQuery table schemas into static CSV files and create a Dialogflow CX Unstructured Data Store.
* **C.** Deploy an Agent Gateway in Client-to-Agent (ingress) mode with mTLS disabled.
* **D.** Write a custom C++ application that executes raw gRPC calls to Model Armor.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The **Data Agent Kit (DAK)** is Google Cloud's open-source plugin and skill pack created specifically for data engineers and analysts. It integrates natively with IDE coding assistants (VS Code, Cursor, Antigravity) and CLI environments, providing pre-built skills and MCP toolboxes for interacting directly with BigQuery, dbt, Spanner, and Dataproc.
  * **Why Distractor B fails:** Static CSV exports in Dialogflow CX cannot execute dynamic SQL queries or run dbt transformation pipelines in an IDE environment.
  * **Why Distractor C fails:** Agent Gateway manages network security policies and SPIFFE identities; disabling mTLS creates a security vulnerability and does not provide IDE BigQuery/dbt data tools.
  * **Why Distractor D fails:** Writing a custom C++ gRPC application adds extreme code complexity, and Model Armor is a content sanitization proxy, not a data engineering IDE plugin.

---

### **Question 4 (Domain 3 - Custom ADK Agents & SkillToolset)**

**Context:** A telecom software architect is developing an autonomous network incident response agent using Python ADK. The architect wants the ADK agent to dynamically load and utilize an existing Agent Skill directory (containing `SKILL.md`, custom Python scripts, and reference documents) as a toolset within the agent application code.

**Goal:** Load the Agent Skill into the ADK agent application.

**Which ADK class should you use in `app/agent.py`?**

* **A.** Instantiate **`SkillToolset`** pointing to the skill directory path (e.g., `SkillToolset(skill_dir="path/to/skill")`) and add it to the agent's `tools` list.
* **B.** Use `agents-cli deploy --d cloud_run --force-skill`.
* **C.** Import the skill directory as a static JSON string inside `session.state["temp:skill"]`.
* **D.** Wrap the skill directory inside a `ParallelAgent` with `max_iterations=0`.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** ADK provides the **`SkillToolset`** class specifically to bridge Agent Skills into custom Python ADK agents. Instantiating `SkillToolset(skill_dir=...)` parses the skill's `SKILL.md` instructions and supporting assets, exposing them directly as executable tools on the ADK agent instance.
  * **Why Distractor B fails:** `agents-cli deploy` builds and deploys container images; it does not import skill directories in Python ADK code.
  * **Why Distractor C fails:** Storing skill files as static JSON in `temp:` state discards them after a single turn and does not convert the skill into callable agent tools.
  * **Why Distractor D fails:** `ParallelAgent` manages concurrent sub-agent workflows; `max_iterations=0` is invalid syntax for a `ParallelAgent` and does not load skill toolsets.

---

### **Question 5 (Domain 3 - Custom ADK Agents & Context Window Isolation)**

**Context:** The telecom network analytics agent needs to run multi-step diagnostic routines against 25 different network telemetry database functions. The lead architect notices that loading all 25 database tool schemas into the root agent causes prompt context bloat and reasoning drift. They want to isolate the execution loop of the database tools while using a lower-cost model (Gemini 1.5 Flash) for the telemetry sub-task and a higher-tier model (Gemini 1.5 Pro) for user interaction.

**Goal:** Achieve tool context isolation and model tiering in ADK.

**Which design pattern should you implement?**

* **A.** Attach all 25 database functions directly as Custom Python Function Tools on the root agent and set the root model to Gemini 1.5 Flash.
* **B.** Store all 25 function connection strings in the `user:` state namespace.
* **C.** Encapsulate the database query logic inside a dedicated sub-agent configured with Gemini 1.5 Flash, and attach the sub-agent to the root agent (configured with Gemini 1.5 Pro) as an **`AgentTool`**.
* **D.** Convert all 25 database tools into system instructions inside a single Dialogflow CX Generator.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Wrapping a specialized sub-agent inside an **`AgentTool`** (Agent-as-a-Tool) isolates the sub-agent's context window. All 25 database tool schemas, intermediate reasoning steps, and raw query output payloads stay inside the sub-agent's own context, returning only the final result to the root agent. It also enables **model tiering**: the sub-agent uses a fast, cost-effective model (Gemini Flash), while the root agent uses a reasoning-heavy model (Gemini Pro).
  * **Why Distractor A fails:** Attaching all 25 functions directly to the root agent causes severe prompt context bloat, increases token billing, and forces the root agent to process raw telemetry logs.
  * **Why Distractor B fails:** Storing connection strings in `user:` state pollutes long-term user memory and does not isolate tool schemas or enable model tiering.
  * **Why Distractor D fails:** Dialogflow CX Generators generate conversational text; they do not handle ADK sub-agent tool context isolation or model tiering in Python applications.

---

### **Scenario 16: Media & Entertainment Global Content Streaming & Localized Asset Post-Production (Dynamic ADK Orchestration)**

**Context / Setup:** A global media and entertainment streaming enterprise manages video asset post-production, multi-language audio dubbing, subtitling, and regional compliance checking across international distribution hubs. The engineering organization is building a multi-agent orchestration architecture in Python using the **Agent Development Kit (ADK)**.

---

### **Question 1 (Domain 3 - Custom ADK Agents)**

**Context:** A post-production master orchestrator agent in Python ADK routes incoming user asset requests to specialized sub-agents (`SubtitlingAgent`, `DubbingAgent`, and `ComplianceAgent`). During testing, engineers notice that the parent orchestrator's LLM occasionally delegates audio localization tasks to `SubtitlingAgent` by mistake.

**Goal:** Ensure the parent orchestrator's LLM accurately delegates user tasks to the correct sub-agent.

**Constraints:**
* Must use standard ADK sub-agent configuration attributes evaluated by the parent model during delegation.
* Must require **no hardcoded regex parsing scripts or custom external proxies**.

**Which configuration adjustment should you make?**

* **A.** Increase the model temperature parameter to `2.0` on the parent orchestrator agent.
* **B.** Hardcode sub-agent names in local `/tmp/` text files on the Cloud Run container instance.
* **C.** Refine and expand each sub-agent's **`description`** attribute (explicitly detailing specific domain responsibilities, input requirements, and capabilities), because the parent LLM evaluates sub-agent `description` strings to decide delegation routing.
* **D.** Convert all sub-agents into Dialogflow CX Custom Entities.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** In ADK multi-agent delegation, parent agents rely on each sub-agent's **`description`** field to determine when and why to delegate tasks. Providing detailed, capability-focused `description` strings enables the parent LLM to accurately route user requests without mis-delegation.
  * **Why Distractor A fails:** Increasing model temperature increases output randomness and creativity, worsening mis-delegation.
  * **Why Distractor B fails:** Writing local `/tmp/` files does not expose sub-agent capabilities to the parent LLM's context window during runtime orchestration.
  * **Why Distractor D fails:** Dialogflow CX Custom Entities are used for NLU slot extraction in conversational flows, not for ADK Python sub-agent delegation.

---

### **Question 2 (Domain 3 - Custom ADK Agents)**

**Context:** When validating localized video metadata, the master orchestrator needs to invoke a `FormatValidationAgent` that executes 10 internal tool-checking functions. The lead architect wants the validation sub-agent to execute its full internal tool loop in isolation and return only a final `ValidationReport` summary to the master orchestrator, without cluttering the master orchestrator's context window with intermediate tool logs.

**Goal:** Select the appropriate ADK delegation pattern.

**Constraints:**
* Must preserve the parent agent's active conversational session control.
* Must encapsulate the sub-agent's intermediate tool executions and reasoning trace within its own context window.

**Which delegation pattern should you implement?**

* **A.** Attach the `FormatValidationAgent` as an **`AgentTool`** (Agent-as-a-Tool) on the master orchestrator's `tools` list.
* **B.** Execute an explicit state transfer using `EventActions(transfer="FormatValidationAgent")` to permanently hand off session control to the sub-agent.
* **C.** Store the sub-agent instance in the `user:` state namespace.
* **D.** Deploy an Agent Gateway in Client-to-Agent (ingress) mode with mTLS disabled.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Wrapping a sub-agent as an **`AgentTool`** encapsulates its internal reasoning loop, tool calls, and intermediate execution traces within its own context window. Once execution completes, it returns only its final output payload to the parent agent, keeping the parent's context window clean.
  * **Why Distractor B fails:** Permanent state transfers (`EventActions(transfer=...)`) hand over active conversation control entirely to the sub-agent rather than returning a tool result back to the master orchestrator.
  * **Why Distractor C fails:** Storing agent instances in `user:` state pollutes long-term user memory and does not execute sub-agent reasoning loops.
  * **Why Distractor D fails:** Agent Gateway manages network security policies and SPIFFE identities; it does not handle ADK application-level sub-agent tool isolation.

---

### **Question 3 (Domain 3 - Custom ADK Agents)**

**Context:** The media streaming platform is conducting an A/B test comparing an experimental subtitling agent (`SubtitleAgentV2`) against the stable version (`SubtitleAgentV1`). Additionally, if an incoming user session belongs to a high-priority enterprise studio account (`session.state["studio_tier"] == "enterprise"`), requests must route to a dedicated high-capacity sub-agent.

**Goal:** Programmatically route incoming requests to the appropriate target sub-agent based on session metadata or routing conditions.

**Constraints:**
* Must evaluate routing conditions *before* invoking sub-agent LLM reasoning.
* Must use built-in ADK agent orchestration classes designed for dynamic routing.

**Which ADK agent class should you use?**

* **A.** `LoopAgent`
* **B.** `ParallelAgent`
* **C.** `SequentialAgent`
* **D.** **`RoutedAgent`**, configuring a custom router function to direct incoming requests to `SubtitleAgentV1`, `SubtitleAgentV2`, or the high-priority sub-agent based on session metadata.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** ADK's **`RoutedAgent`** uses a developer-defined routing function to evaluate session state, user attributes, or experimental flags *before* execution, dynamically directing the request to the designated target sub-agent.
  * **Why Distractor A fails:** `LoopAgent` repeatedly executes sub-agents in a sequential loop until a termination condition is met.
  * **Why Distractor B fails:** `ParallelAgent` executes all sub-agents concurrently, which would run both A/B versions simultaneously and multiply execution costs.
  * **Why Distractor C fails:** `SequentialAgent` executes sub-agents serially in a fixed linear pipeline.

---

### **Question 4 (Domain 3 - Custom ADK Agents)**

**Context:** The post-production pipeline requires a specialized processing step that calculates video checksums and verifies video frame encoding parameters using custom Python libraries without invoking an LLM. This custom step must plug directly into an ADK `SequentialAgent` pipeline alongside standard LLM sub-agents.

**Goal:** Implement a custom non-LLM agent component in ADK.

**Constraints:**
* Must subclass the core ADK agent base class.
* Must override the official ADK asynchronous execution method to implement custom Python logic.

**Which implementation pattern should you execute?**

* **A.** Subclass `DialogflowCX` and override `detect_intent()`.
* **B.** Subclass **`BaseAgent`** and override the **`_run_async_impl`** method to execute custom Python processing logic asynchronously within the ADK invocation context.
* **C.** Instantiate `McpToolset` with `stdio` parameters inside `session.state["temp:code"]`.
* **D.** Modify `agents-cli-manifest.yaml` to execute a C++ binary.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** When developers need custom programmatic execution control without calling an LLM, ADK's design pattern is to subclass **`BaseAgent`** and override the **`_run_async_impl`** method. This allows custom Python logic to run asynchronously while conforming to the ADK agent interface for seamless integration into multi-agent workflows.
  * **Why Distractor A fails:** `DialogflowCX` is a low-code platform service integration, not the Python ADK base class for custom code agent components.
  * **Why Distractor C fails:** `McpToolset` manages Model Context Protocol tools; placing `stdio` params in `temp:` state does not create a custom ADK agent component.
  * **Why Distractor D fails:** `agents-cli-manifest.yaml` manages project metadata and deployment targets; it does not compile or execute custom C++ agent logic.

---

### **Question 5 (Domain 3 - Custom ADK Agents)**

**Context:** Asset post-production workflows require a non-linear, state-driven orchestration pattern with conditional branching, feedback cycles between quality assurance sub-agents, and dynamic fallback jumps based on intermediate processing statuses.

**Goal:** Select the orchestration framework in ADK that supports complex cyclic and conditional execution topologies beyond linear pipeline templates.

**Which orchestration model should you select?**

* **A.** Implement an **ADK Graph Workflow**, defining discrete agent execution nodes connected by dynamic, conditional edges and feedback cycles.
* **B.** Hardcode all state transitions into static system instructions inside a single Dialogflow CX Generator.
* **C.** Create 100 individual Model Armor templates in `Inspect only` mode.
* **D.** Deploy a static `ParallelAgent` and disable `session.state`.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** ADK supports **Graph Workflows**, which model execution as state graphs containing discrete agent nodes and dynamic, conditional edges. This allows building non-linear execution topologies, conditional branching, and feedback loops that linear templates (like `SequentialAgent`) cannot represent.
  * **Why Distractor B fails:** Dialogflow CX Generators produce conversational text; they cannot execute Python ADK multi-agent state graphs.
  * **Why Distractor C fails:** Model Armor handles content security sanitization, not application workflow orchestration.
  * **Why Distractor D fails:** Disabling `session.state` destroys workflow memory, and `ParallelAgent` cannot represent conditional feedback cycles.

---

### **Scenario 17: Wealth Management & Private Banking Operations (Assistant with State + Long-Term Memory)**

**Context / Setup:** A global wealth management enterprise operates private banking advisory portals. The engineering organization is developing an autonomous investment assistant using the **Agent Development Kit (ADK)** to manage active advisory conversations, maintain session state, and leverage long-term memory across client interactions.

---

### **Question 1 (Domain 3 - Custom ADK Agents)**

**Context:** A developer is building the private banking assistant in ADK. The assistant needs to store two types of state variables: (1) global market trading status flags (e.g., whether stock exchanges are currently open) that must be shared across **all users and all sessions**, and (2) active conversation variables (e.g., the current portfolio ID being discussed) that must persist throughout a **single active conversation session** for one client.

**Goal:** Select the correct state namespace key conventions for global shared variables versus session-scoped variables.

**Constraints:**
* Must use standard ADK state namespace prefix conventions.
* Must correctly distinguish between global application-scoped state and single-session conversation state.

**Which state namespace configuration should you apply?**

* **A.** Store global market flags in the `temp:` state namespace, and store active conversation variables in the `user:` state namespace.
* **B.** Store global market flags using the **`app:`** state namespace prefix (e.g., `session.state["app:market_open"]`), and store active conversation variables using **no-prefix** state keys (e.g., `session.state["portfolio_id"]`).
* **C.** Store global market flags in the `user:` state namespace, and store active conversation variables in the `temp:` state namespace.
* **D.** Store both global market flags and active conversation variables in the `temp:` state namespace.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** ADK state namespaces follow explicit prefix rules:
    * **`app:`**: Application-scoped state shared globally across **all users and all sessions** (ideal for global configuration flags like `app:market_open`).
    * **No prefix**: Session-scoped state persisted throughout a **single active conversation session** (ideal for session context like `portfolio_id`).
  * **Why Distractor A fails:** `temp:` is cleared at the end of every turn (not preserved across the session), and `user:` persists across *all* past/future sessions for a single user rather than being scoped to the current active session.
  * **Why Distractor C fails:** `user:` scopes data to an individual user (not shared globally across all users), and `temp:` is discarded after a single turn.
  * **Why Distractor D fails:** `temp:` state is turn-scoped and deleted at the end of each turn; neither global flags nor session variables would persist.

---

### **Question 2 (Domain 3 - Custom ADK Agents)**

**Context:** The wealth management firm wants the private banking assistant to remember a client's long-term financial goals, risk tolerance history, and key life events (e.g., retirement targets, tax preferences) discussed across dozens of separate conversation sessions over several years.

**Goal:** Select the platform long-term memory architecture that automatically distills, consolidates, and indexes unstructured user facts across historical sessions into a searchable long-term memory store.

**Constraints:**
* Must provide automated semantic distillation and consolidation of user profile facts across sessions.
* Must integrate natively with Google Cloud agent platform memory infrastructure.

**Which memory architecture should you deploy?**

* **A.** Save session transcripts into local text files in the `/tmp/` directory of the application container instance.
* **B.** Store all historical conversation turns as a single string inside the `app:` state namespace.
* **C.** Create a Dialogflow CX Custom Entity table with `max_digits=50`.
* **D.** Deploy **Agent Platform Memory Bank** (or ADK `MemoryBank` / `VertexAiMemoryBankService`), which continuously distills, consolidates, and indexes user facts across past conversation sessions into a long-term semantic memory store.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** **Agent Platform Memory Bank** (integrated in ADK via `MemoryBank` / `VertexAiMemoryBankService`) is designed specifically for long-term memory persistence. It automatically extracts, consolidates, and indexes unstructured user profile facts and preferences across past conversation sessions, making them semantically searchable in future interactions.
  * **Why Distractor A fails:** Ephemeral `/tmp/` files on container instances are deleted when serverless instances scale down or restart.
  * **Why Distractor B fails:** `app:` state is shared across *all* users globally, which would dangerously mix different clients' private financial profiles together and exceed token limits.
  * **Why Distractor C fails:** Dialogflow CX custom entities handle slot extraction in conversational flows; they do not perform automated semantic memory distillation or long-term user fact indexing.

---

### **Question 3 (Domain 3 - Custom ADK Agents)**

**Context:** An ADK developer is writing the session termination handler for the wealth management assistant. When a client finishes a conversation session, the application must ingest the entire completed `Session` object—including its full turn history and event logs—into the `MemoryBankService` so the memory engine can extract new user profile insights.

**Goal:** Call the correct ADK memory service method to save the complete session object into memory.

**Which ADK memory service method should you execute?**

* **A.** Call **`add_session_to_memory(session)`** on the memory service instance, passing the completed session object.
* **B.** Call `add_events_to_memory(events)` to delete past session records from memory.
* **C.** Call `add_memory(string)` to execute a C++ script on a GKE cluster.
* **D.** Call `clear_user_state()` on `McpToolset`.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** In the ADK memory API, **`add_session_to_memory(session)`** is the official method for persisting a full `Session` object into the memory service. This allows Memory Bank to process the session's complete event history and extract structured facts into long-term memory.
  * **Why Distractor B fails:** `add_events_to_memory` ingests event lists into memory; it does not delete session records from memory.
  * **Why Distractor C fails:** `add_memory` takes raw text memories, but `add_memory(string)` does not execute C++ scripts on GKE clusters.
  * **Why Distractor D fails:** `clear_user_state()` on `McpToolset` is a fabricated method; `McpToolset` manages Model Context Protocol tools, not session memory ingestion.

---

### **Question 4 (Domain 3 - Custom ADK Agents)**

**Context:** The bank's data governance and compliance team specifies two mandatory security requirements for the client memory system: (1) **strict user identity isolation** (ensuring Client A's financial memory records can never be retrieved by Client B), and (2) **time-to-live (TTL) retention policies** to automatically purge client memory records after 7 years to comply with financial privacy regulations.

**Goal:** Configure Memory Bank security and lifecycle settings to meet both compliance constraints.

**Which configuration should you apply?**

* **A.** Store all client memory records in the `app:` state namespace and disable user authentication.
* **B.** Configure Memory Bank to export client memories to a public Cloud Storage bucket without IAM controls.
* **C.** Scope Memory Bank instances by explicit **user identity (`user_id`)** to guarantee multi-tenant identity isolation, and configure **TTL retention policies** on the Memory Bank resource to enforce automated data purging after 7 years.
* **D.** Store client memory records in local `.env` files on developer laptops.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Memory Bank enforces strict multi-tenant isolation by binding memory records to a specific **`user_id`**, ensuring users can only search and retrieve their own historical memories. Furthermore, configuring **TTL (time-to-live) retention policies** on the Memory Bank resource automatically purges memory entries older than the specified retention window, satisfying regulatory compliance requirements.
  * **Why Distractor A fails:** `app:` state is shared across all users globally, completely destroying user identity isolation and exposing private financial data across tenants.
  * **Why Distractor B fails:** Exporting memories to a public Cloud Storage bucket without IAM controls violates enterprise security and privacy regulations.
  * **Why Distractor D fails:** Storing client financial memories in local `.env` files on developer laptops violates enterprise data privacy laws and creates severe credential/data leakage risks.

---

### **Question 5 (Domain 3 - Custom ADK Agents)**

**Context:** The wealth management firm is deploying the private banking agent to Google Cloud Run. The service expects thousands of concurrent clients, and requests from the same user may hit different container instances across consecutive turns.

**Goal:** Select a production-grade, distributed session storage backend that ensures short-term session state (`session.state`) and conversation history persist reliably across horizontally scaling container instances.

**Which session storage architecture should you deploy?**

* **A.** Use `InMemorySessionService` to store session state in the application container's local RAM.
* **B.** Save session state objects as JSON text files in the `/tmp/` directory of the Cloud Run container instance.
* **C.** Store session state as prompt instructions inside a Model Armor template.
* **D.** Deploy a managed production session backend using **`DatabaseSessionService`** (backed by Cloud SQL or AlloyDB), **`FirestoreSessionService`**, or **`Agent Platform Sessions`**.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** For stateless container runtimes like Cloud Run, ADK provides production-grade, externalized session storage options: **`DatabaseSessionService`** (Cloud SQL / AlloyDB), **`FirestoreSessionService`**, or **`Agent Platform Sessions`**. Externalizing session storage ensures that any container instance can read and update the active session state seamlessly as nodes scale up or down.
  * **Why Distractor A fails:** `InMemorySessionService` stores sessions in local process RAM, meaning session state is lost when requests hit different container instances or when containers scale down.
  * **Why Distractor B fails:** Container `/tmp/` directories are ephemeral and isolated to a single container instance; disk files are lost on container restart.
  * **Why Distractor C fails:** Model Armor templates are security policy definitions for content sanitization, not persistent session data stores.

---

### **Scenario 18: Global Hospitality & Luxury Hotel Operations (Agents Calling SaaS on User's Behalf)**

**Context / Setup:** A global luxury hospitality brand operates digital concierge and property management virtual assistants. The assistant integrates with internal booking engines and third-party SaaS platforms (such as Salesforce CRM, external flight/transportation booking portals, and payment gateways) to fulfill guest requests, manage loyalty accounts, and coordinate high-value guest amenities.

---

### **Question 1 (Domain 3 - Custom ADK Agents)**

**Context:** A guest asks the digital concierge agent to link their hotel profile to an external airline partner's SaaS portal to update flight arrival preferences. The agent must access the external partner API specifically on behalf of the authenticated guest, respecting the guest's individual identity and permissions.

**Goal:** Authenticate the agent to access the third-party SaaS API on behalf of the individual user.

**Constraints:**
* Must enforce individual user delegation and user consent.
* Must NOT use a static, shared API key or administrative service account across all hotel guests.

**Which authentication design pattern should you implement?**

* **A.** Integrate **Auth Manager** (or ADK OAuth Tool / Agent Platform Auth) to execute a **3-legged OAuth 2.0 authorization code flow**, prompting the user to grant consent and securely managing per-user access and refresh tokens tied to the user's session.
* **B.** Hardcode a single administrative API key for the external SaaS service directly inside the agent's system prompt instructions.
* **C.** Generate a shared service account JSON key with organization-wide admin privileges and embed it in the container image.
* **D.** Prompt the user to type their external SaaS account password in chat and save it in `session.state["temp:password"]`.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** When an agent needs to access third-party SaaS applications on behalf of an individual user, Google Cloud agent architecture relies on **Auth Manager / 3-legged OAuth 2.0 authorization flows**. This prompts the end-user for explicit consent, generates user-scoped OAuth tokens, and securely manages access/refresh token lifecycles without exposing user credentials or using shared administrative keys.
  * **Why Distractor B fails:** Hardcoding a single API key exposes a shared credential in prompt memory and fails to enforce individual user identity or permission scoping.
  * **Why Distractor C fails:** Embedding shared service account keys with root admin privileges in container images violates the principle of least privilege and exposes global access if intercepted.
  * **Why Distractor D fails:** Storing plaintext user passwords in `temp:` state violates data privacy standards, risks credential leakage, and fails to use secure OAuth protocols.

---

### **Question 2 (Domain 3 - Custom ADK Agents)**

**Context:** The hotel enterprise operates over 40 specialized micro-agents, remote MCP toolboxes, and custom Agent Skills across various hotel brands and regional properties. The enterprise architecture team needs a centralized governance catalog where developers and orchestrator agents can publish, search, and discover approved agents, MCP toolboxes, and skill packages.

**Goal:** Deploy a centralized governance catalog for enterprise agentic assets.

**Which Google Cloud platform component should you implement?**

* **A.** Store agent endpoint URLs and skill manifests in a static CSV file on local developer desktops.
* **B.** Publish and catalog all agents, MCP toolboxes, and skill packages in **Agent Registry**, enabling enterprise discovery, versioning, IAM access management, and metadata tagging.
* **C.** Create a Dialogflow CX Custom Entity table with `max_digits=100`.
* **D.** Deploy Model Armor in `Inspect only` mode on Cloud Run.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** **Agent Registry** on Gemini Enterprise Agent Platform is the centralized enterprise directory for cataloging, discovering, and governing agentic assets—including ADK agents, MCP toolboxes, and Agent Skills. It provides metadata management, versioning, search capabilities, and IAM access control across organizational boundaries.
  * **Why Distractor A fails:** Local desktop CSV files lack enterprise search, access control, versioning, and programmatic API discovery.
  * **Why Distractor C fails:** Dialogflow CX custom entities handle NLU slot extraction in conversational flows, not enterprise registry cataloging for MCP tools and ADK agents.
  * **Why Distractor D fails:** Model Armor in `Inspect only` mode logs content security risks; it is not a discovery registry for software assets.

---

### **Question 3 (Domain 3 - Custom ADK Agents)**

**Context:** A primary hotel concierge agent needs to dynamically discover the capabilities of an independent spa reservation agent running in a separate regional GCP project before delegating a guest booking request.

**Goal:** Establish inter-agent communication and capability discovery over the network using standardized Agent2Agent (A2A) components.

**Which configuration should you deploy?**

* **A.** Hardcode gRPC socket IP addresses inside the concierge agent's Python system instructions.
* **B.** Refactor both regional agents into a single monolithic C++ codebase.
* **C.** Store agent capabilities as base64-encoded strings inside `session.state["temp:a2a"]`.
* **D.** Expose the spa reservation agent using an **`A2AServer`** that publishes an **Agent Card** (`/.well-known/agent.json` detailing capabilities, endpoints, and authentication schemas), and consume it in the concierge agent using a **`RemoteA2aAgent`** client proxy.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** In the **Agent2Agent (A2A) protocol**, an agent service is exposed via an **`A2AServer`**, which publishes an **Agent Card** (a standardized metadata JSON document at `/.well-known/agent.json` describing skills, parameters, and auth requirements). Remote calling agents consume this service using a **`RemoteA2aAgent`** client proxy.
  * **Why Distractor A fails:** Hardcoding raw IP addresses in system prompts fails to discover dynamic agent capabilities or handle authenticated A2A protocols.
  * **Why Distractor B fails:** Merging independent regional micro-services into a single C++ monolith destroys modularity and cross-project deployment isolation.
  * **Why Distractor C fails:** Storing base64 strings in `temp:` state does not provide standardized network protocol endpoints or Agent Card discovery.

---

### **Question 4 (Domain 3 - Custom ADK Agents)**

**Context:** When the concierge agent delegates a private yacht charter booking request to an external partner's A2A agent, the partner agent executes a complex multi-vendor availability check that takes 60 seconds to finalize.

**Goal:** Handle the multi-agent task execution without incurring HTTP connection timeouts or losing progress updates.

**Which native protocol mechanism does A2A provide for this scenario?**

* **A.** A2A forces a strict 5-second synchronous HTTP REST timeout and cancels the task if incomplete.
* **B.** The sub-agent saves intermediate progress to local `/tmp/` container text files and sends SSH pings.
* **C.** A2A natively supports **asynchronous long-running task management and event streaming**, allowing the sub-agent to stream task status updates and final artifacts back to the calling agent without timing out.
* **D.** The sub-agent converts booking data into base64 audio strings in Dialogflow CX.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** The **A2A protocol** is designed for asynchronous, distributed multi-agent operations. It natively supports **long-running task tracking and streaming event updates**, allowing calling agents to monitor progress and receive final task results or artifacts across network boundaries without HTTP connection timeouts.
  * **Why Distractor A fails:** Forcing a 5-second timeout breaks long-running multi-vendor booking operations.
  * **Why Distractor B fails:** Local container `/tmp/` files are completely inaccessible across network boundaries to calling remote agents.
  * **Why Distractor D fails:** Converting booking payloads into base64 audio in Dialogflow CX is invalid for A2A inter-agent JSON data streaming.

---

### **Question 5 (Domain 5 - Security & Governance)**

**Context:** The digital concierge agent is authorized to retrieve room availability and recommend local attractions. However, performing an irreversible action—such as charging a guest's credit card for a non-refundable penthouse upgrade exceeding \$1,000—is classified as a high-risk financial transaction.

**Goal:** Prevent the agent from executing high-risk or financial transaction tools without explicit human validation.

**Constraints:**
* Must enforce security guardrails at the tool invocation lifecycle layer.
* Must require human confirmation before executing the underlying transaction API tool call.

**Which guardrail pattern should you implement?**

* **A.** Allow the agent to complete the financial transaction automatically and email a receipt to the guest afterward.
* **B.** Implement a **Human-in-the-Loop (HITL)** confirmation mechanism using ADK callbacks (e.g., `before_tool_callback` or a policy engine gate) that intercepts the high-risk tool call, pauses execution, and prompts the user or manager for explicit approval before proceeding.
* **C.** Increase the LLM temperature parameter to `2.0` in `app/agent.py`.
* **D.** Save raw credit card details into the global `app:` state namespace.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** For high-risk, sensitive, or financially consequential tool actions, Google Cloud agent security architecture dictates implementing **Human-in-the-Loop (HITL)** confirmation controls. By leveraging ADK callbacks (like `before_tool_callback`) or policy engine rules, the framework intercepts the pending tool call, pauses execution, and demands explicit human approval before invoking the backend API.
  * **Why Distractor A fails:** Executing financial transactions automatically without confirmation exposes guests to unintended charges if the LLM misinterprets an intent or hallucinates.
  * **Why Distractor C fails:** Increasing model temperature increases output randomness and hallucinations, raising transaction risks.
  * **Why Distractor D fails:** Storing credit card details in global `app:` state exposes sensitive financial data to all tenants and users globally, violating PCI-DSS compliance.

---

### **Scenario 19: Global Mining & Heavy Geological Exploration Operations (RAG over a Large Corpus)**

**Context / Setup:** A global mining and mineral exploration enterprise maintains over 500,000 complex geological survey reports, core sample drill logs, PDF site maps, and regulatory environmental impact assessments. The geotechnical engineering team is building an autonomous exploration research assistant using **Gemini Enterprise Agent Platform / RAG Engine** and the **Agent Development Kit (ADK)**.

---

### **Question 1 (Domain 3 - Custom Agents / RAG)**

**Context:** The exploration research assistant needs to ingest multi-page geological survey PDFs containing complex layout structures—such as drill depth tables, multi-column survey text, and nested geological headings. The data engineering team notices that standard fixed-character chunking breaks table rows across chunk boundaries, corrupting tabular data retrieval.

**Goal:** Select an ingestion chunking and parsing strategy in RAG Engine that preserves document layout and tabular data integrity.

**Constraints:**
* Must preserve structural relationships between table headers, rows, and section titles during document ingestion.
* Must require **no custom line-by-line regex parsing scripts**.

**Which ingestion strategy should you implement?**

* **A.** Apply fixed-length 100-character chunking with zero overlap and strip all Markdown headers.
* **B.** Convert all PDFs into base64 audio strings and save them into `session.state["temp:audio"]`.
* **C.** Disable document parsing completely and rely on the LLM to guess table boundaries from unindexed binary files.
* **D.** Enable **layout-aware parsing** (e.g., using Document AI / layout-based chunking in RAG Engine) to chunk documents along logical section headings, paragraphs, and structural table boundaries, preserving tabular data integrity.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** **Layout-aware parsing** (integrated into RAG Engine via layout chunking / Document AI) analyzes the visual and structural layout of complex documents (headings, paragraphs, multi-column blocks, and tables). It chunks text along logical structural boundaries, ensuring table rows stay connected to their headers and section contexts without breaking across arbitrary character cutoffs.
  * **Why Distractor A fails:** Fixed-length 100-character chunking arbitrarily slices sentences and table rows mid-line, destroying structural context and tabular relationships.
  * **Why Distractor B fails:** Converting document PDFs into base64 audio strings in `temp:` state is invalid for document indexing and discards tabular layout structures.
  * **Why Distractor C fails:** Disabling parsing leaves document binaries unindexed, rendering them unsearchable in vector and keyword retrieval systems.

---

### **Question 2 (Domain 3 - Custom Agents / RAG)**

**Context:** Geologists search the exploratory document database using exact alphanumeric survey codes (e.g., `drill site #AU-2024-89B`) alongside broad natural language queries (e.g., *"lithology and gold mineralization in quartz vein structures"*). Pure vector search struggles to retrieve exact site code identifiers, while keyword search misses semantically related rock formation synonyms.

**Goal:** Implement a search architecture that delivers high recall for both exact alphanumeric survey codes and broad conceptual natural language queries.

**Constraints:**
* Must execute keyword search and semantic vector search concurrently.
* Must combine and re-rank candidate lists using a standardized score-merging algorithm before handing context to the LLM.

**Which retrieval architecture should you implement?**

* **A.** Deploy pure vector search with cosine distance and set `temperature=2.0`.
* **B.** Store exact codes in local `.env` files on developer laptops and search via bash scripts.
* **C.** Implement **Hybrid Search**, combining keyword search (sparse retrieval) and vector similarity search (dense retrieval) in parallel, and merge the candidate lists using **Reciprocal Rank Fusion (RRF)** before handing context to the LLM.
* **D.** Convert all geological survey codes into base64 audio in Dialogflow CX.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** **Hybrid Search** combines sparse keyword search (which excels at exact matching for IDs, survey codes, and proper nouns) and dense vector search (which excels at semantic conceptual understanding) in parallel. The candidate lists are merged using **Reciprocal Rank Fusion (RRF)**, producing a balanced candidate list for complex enterprise RAG workloads.
  * **Why Distractor A fails:** Pure vector search frequently misses exact alphanumeric strings (like `AU-2024-89B`) because vector embeddings map semantic concepts rather than exact character tokens; setting temperature to `2.0` increases hallucination rates.
  * **Why Distractor B fails:** Local `.env` files on developer laptops cannot scale to search 500,000 geological survey documents.
  * **Why Distractor D fails:** Base64 audio in Dialogflow CX does not provide hybrid text/vector search capabilities over document corpora.

---

### **Question 3 (Domain 3 - Custom Agents / RAG)**

**Context:** After executing hybrid search against the geological document corpus, RAG Engine retrieves 50 candidate document passages. Passing all 50 passages directly into the LLM context window increases latency, bloats token costs, and causes "lost-in-the-middle" attention degradation.

**Goal:** Filter and re-score the 50 candidate passages down to the top 5 most relevant chunks before constructing the final prompt payload.

**Constraints:**
* Must compute precise cross-encoder relevance scores on candidate chunks relative to the user query.
* Must optimize prompt context size and reduce LLM token consumption.

**Which architectural step should you insert between retrieval and LLM synthesis?**

* **A.** Increase `max_iterations=50` on an ADK `LoopAgent` to read all 50 chunks in 50 consecutive LLM turns.
* **B.** Pass the candidate passages through the **Agent Search Ranking API (or Vertex AI Ranking API)** to compute precise semantic relevance scores and select the top \\(N\\) re-ranked passages for LLM synthesis.
* **C.** Store candidate passages in the global `app:` state namespace and disable IAM.
* **D.** Deploy a Model Armor template in `Inspect and block` mode to drop 45 passages at random.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Re-ranking candidate passages using the **Agent Search Ranking API / Vertex AI Ranking API** computes cross-encoder semantic relevance scores between the query and retrieved candidates. Re-ranking isolates the top \\(N\\) most relevant chunks (e.g., top 5 out of 50), significantly reducing context token size, improving LLM response accuracy, and eliminating attention degradation.
  * **Why Distractor A fails:** Executing 50 consecutive LLM turns in a loop increases execution latency by 50x and massively multiplies token costs.
  * **Why Distractor C fails:** Storing chunks in `app:` state is shared across all users globally, exposing data across tenants without performing semantic relevance re-ranking.
  * **Why Distractor D fails:** Model Armor is a security content sanitization filter; dropping candidate chunks at random destroys context quality.

---

### **Question 4 (Domain 4 - Evaluation, Deployment & Observability)**

**Context:** The geotechnical exploration team needs to automatically evaluate whether the exploration assistant's generated answers are strictly grounded in retrieved geological survey passages or if the model is outputting hallucinated mineral concentration figures not stated in the source text.

**Goal:** Configure an automated AgentOps evaluation metric to measure factual grounding.

**Constraints:**
* Must use an automated metric in `agents-cli eval` / Vertex AI Evaluation service.
* Must explicitly measure factual overlap between generated model responses and retrieved source context passages.

**Which evaluation metric should you configure?**

* **A.** Measure the **Groundedness autorater metric**, which uses an LLM-as-a-judge to evaluate whether every factual claim in the generated response is directly traceable to the retrieved context passages.
* **B.** Measure `ROUGE-1` unigram overlap between the generated response and the user prompt string.
* **C.** Configure a Model Armor template to block all prompts containing the word "gold".
* **D.** Set `min_instances=100` on the Cloud Run deployment revision.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** In AgentOps evaluation frameworks (`agents-cli eval`), **Groundedness** is the primary metric for detecting hallucinations in RAG systems. An LLM autorater compares every factual assertion in the generated answer against the retrieved reference passages, calculating a score (e.g., 1–5) based on how strictly the output is supported by source context.
  * **Why Distractor B fails:** `ROUGE-1` measures unigram text overlap against a reference string; comparing output text to the user prompt string does not measure factual grounding against source context documents.
  * **Why Distractor C fails:** Blocking keywords in Model Armor is a security policy; it does not measure or evaluate factual grounding in RAG outputs.
  * **Why Distractor D fails:** `min_instances` controls serverless container warm instances; it has no relationship to model evaluation metrics.

---

### **Question 5 (Domain 4 - Evaluation, Deployment & Observability)**

**Context:** The data engineering team updates the RAG Engine chunking configuration from 500-token chunks to 200-token chunks. They re-run the evaluation suite against the golden dataset, generating a new evaluation result artifact (`results_v2.json`). They need to compare `results_v2.json` against the baseline `results_v1.json` to identify specific test queries where groundedness or tool recall regressed.

**Goal:** Perform automated side-by-side comparison of evaluation run artifacts to highlight performance regressions.

**Which `agents-cli` command should you execute?**

* **A.** `agents-cli create --prototype`
* **B.** `uvx google-agents-cli setup --reset`
* **C.** `agents-cli deploy --d gke`
* **D.** Execute **`agents-cli eval compare`** (or `eval analyze`), providing the baseline (`results_v1.json`) and candidate (`results_v2.json`) evaluation result artifacts to generate a side-by-side metric diff and highlight regressed test cases.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** **`agents-cli eval compare`** (and `eval analyze`) performs automated diff analysis between two evaluation result JSON artifacts. It outputs a side-by-side breakdown comparing groundedness, tool recall, and latency metrics across test cases, immediately flagging queries where the candidate configuration regressed compared to the baseline.
  * **Why Distractor A fails:** `agents-cli create --prototype` scaffolds a new local project directory.
  * **Why Distractor B fails:** `uvx google-agents-cli setup --reset` re-installs CLI binaries and IDE skills.
  * **Why Distractor C fails:** `agents-cli deploy` builds and deploys container images to target environments like GKE.

---

### **Scenario 20: Enterprise FinTech & Payment Settlement Infrastructure (Production on GKE & Agent Runtime)**

**Context / Setup:** An enterprise FinTech institution operates high-volume payment settlement, fraud detection, and multi-currency reconciliation services. The engineering organization is deploying containerized Agent Development Kit (ADK) settlement agents to production, using **Google Kubernetes Engine (GKE)**, **Agent Runtime**, **BigQuery Agent Analytics**, and automated evaluation pipelines.

---

### **Question 1 (Domain 4 - Evaluate, Deploy, Observe)**

**Context:** An infrastructure team is evaluating deployment runtimes for a containerized payment settlement agent. The payment engineering team introduces a new operational constraint: the agent application requires fine-grained control over underlying Kubernetes node pool machine types, custom C++ networking sidecars for legacy mainframe connectivity, and dedicated GPU/TPU accelerator pools for real-time fraud inference.

**Goal:** Select the optimal Google Cloud execution runtime that satisfies all operational constraints.

**Constraints:**
* Must provide maximum infrastructure control over Kubernetes cluster node pools, custom sidecars, and hardware accelerators.
* Requires container orchestration and cluster management capabilities.

**Which deployment target should you select?**

* **A.** Deploy the agent to **Agent Runtime** using `agents-cli deploy -d agent_runtime`.
* **B.** Deploy the agent to **Google Kubernetes Engine (GKE)**, which provides maximum infrastructure control over node pools, custom sidecar containers, and specialized hardware accelerators.
* **C.** Deploy the agent to Cloud Run with `min_instances=0` and disable VPC egress.
* **D.** Export the agent into a Dialogflow CX Custom Entity table.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** **Google Kubernetes Engine (GKE)** provides maximum control and flexibility over containerized agent workloads. It allows teams to configure custom node pools, deploy specialized machine accelerators (GPUs/TPUs), run sidecar containers (like C++ daemons), and manage fine-grained Kubernetes security and networking policies.
  * **Why Distractor A fails:** Agent Runtime is a fully managed, opinionated serverless Python execution environment; it does not allow managing underlying Kubernetes clusters, node pools, or custom C++ sidecar containers.
  * **Why Distractor C fails:** Cloud Run is a serverless container platform for stateless HTTP services; it does not support managing custom Kubernetes node pools or multi-container pod sidecars with dedicated GPU clusters.
  * **Why Distractor D fails:** Dialogflow CX custom entities are NLU slot-extraction parameters in conversational chatbots, not compute execution runtimes.

---

### **Question 2 (Domain 4 - Evaluate, Deploy, Observe)**

**Context:** The FinTech security team is configuring private networking for two distinct payment agents: Agent 1 is deployed on **Agent Runtime**, while Agent 2 is deployed on **Cloud Run**. Both agents must initiate private outbound connections into the enterprise VPC network to query internal Cloud SQL payment databases without exposing traffic to the public internet.

**Goal:** Select the correct private VPC egress mechanism for each deployment runtime according to Google Cloud networking reference architectures.

**Which private networking configuration should you implement?**

* **A.** Configure a **Private Service Connect (PSC) interface** (via a Network Attachment in the subnet) for Agent Runtime, and use **Direct VPC egress** for Cloud Run.
* **B.** Use Direct VPC egress for Agent Runtime, and a Private Service Connect interface for Cloud Run.
* **C.** Assign public IP addresses to Cloud SQL and enable `ALLOW_UNAUTHENTICATED` access across all projects.
* **D.** Pass database payloads over base64-encoded audio streams in Dialogflow CX.

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Google Cloud networking architecture specifies distinct private egress mechanisms per agent runtime:
    * **Agent Runtime**: Connects to customer VPC networks via a **Private Service Connect (PSC) interface** attached to a Network Attachment in the target VPC subnet.
    * **Cloud Run**: Connects directly to customer VPC subnets via **Direct VPC egress**.
  * **Why Distractor B fails:** Reverses the networking mechanisms; Agent Runtime uses PSC interfaces, while Cloud Run uses Direct VPC egress.
  * **Why Distractor C fails:** Assigning public IPs and allowing unauthenticated access exposes private payment databases to the public internet, violating security baselines.
  * **Why Distractor D fails:** Base64 audio in Dialogflow CX is not a valid private network egress mechanism for database queries.

---

### **Question 3 (Domain 4 - Evaluate, Deploy, Observe)**

**Context:** Financial controllers at the FinTech enterprise need real-time visibility into prompt and response token costs, execution latency, and model call volume across all deployed ADK payment agents. They require a centralized analytics pipeline that streams telemetry directly into BigQuery for SQL cost reporting.

**Goal:** Stream agent execution telemetry and token consumption metrics into BigQuery with minimal custom code.

**Which observability component should you enable?**

* **A.** Write custom Python code inside every tool function to execute synchronous SQL `INSERT` statements against Cloud SQL.
* **B.** Save token metrics into the `temp:` state namespace in ADK.
* **C.** Enable the **BigQuery Agent Analytics plugin** (or BigQuery agent ops plugin) for ADK, which streams detailed agent interactions, token counts, and latency metrics directly into BigQuery tables with a single line of configuration.
* **D.** Save execution trace logs as plain text files in local `/tmp/` container directories.

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** The **BigQuery Agent Analytics plugin** (and BigQuery agent ops integration for ADK) continuously streams detailed agent execution telemetry—including input/output token counts, execution latency, model calls, and session metadata—directly into BigQuery tables without adding custom database insertion logic to application tools.
  * **Why Distractor A fails:** Writing manual SQL `INSERT` statements inside every tool function introduces execution latency, couples business logic to database infrastructure, and increases connection overhead.
  * **Why Distractor B fails:** `temp:` state is cleared at the end of every turn and does not persist or stream data to BigQuery for cost analytics.
  * **Why Distractor C fails:** Local `/tmp/` files on container instances are ephemeral and deleted when serverless instances scale down, leading to telemetry data loss.

---

### **Question 4 (Domain 4 - Evaluate, Deploy, Observe)**

**Context:** During pre-release evaluation of a payment reconciliation agent, developers observe that candidate prompt changes caused the agent's accuracy score to drop below the required threshold. To automatically refine the system instructions without tedious manual prompt trial-and-error, the lead engineer wants to run an automated prompt optimization tool provided by `agents-cli`.

**Goal:** Execute the `agents-cli` command for algorithmic prompt optimization using the GEPA framework.

**Which command should you execute?**

* **A.** `agents-cli create --prototype`
* **B.** `agents-cli deploy -d gke`
* **C.** `agents-cli eval compare results_v1.json results_v2.json`
* **D.** Execute **`agents-cli eval optimize`** (which runs `adk optimize` using the GEPA framework), specifying the evaluation dataset and target metric to automatically refine system instructions.

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** **`agents-cli eval optimize`** (powered by the GEPA framework / `adk optimize`) algorithmically evaluates failure patterns in evaluation datasets and iteratively rewrites system instructions to maximize target evaluation metrics, eliminating manual guess-and-check prompt engineering.
  * **Why Distractor A fails:** `agents-cli create --prototype` scaffolds a local project directory.
  * **Why Distractor B fails:** `agents-cli deploy -d gke` deploys agent containers to a GKE cluster.
  * **Why Distractor C fails:** `agents-cli eval compare` produces a side-by-side diff between two existing evaluation result JSON files; it does not optimize prompts.

---

### **Question 5 (Domain 4 - Evaluate, Deploy, Observe)**

**Context:** The FinTech enterprise deploys a new payment reconciliation agent revision (v2) using a 90/10 canary traffic split. Operations, security, and product teams need to monitor three essential categories of metrics during the canary release to validate candidate health before proceeding to a full 100% rollout.

**Goal:** Identify the three core metric categories required during a canary deployment.

**Which metric category combination should you monitor?**

* **A.** Container disk space, Git commit count, and Dockerfile line limits.
* **B.** **Business metrics** (tracking operational outcomes, like payment conversion or settlement rates), **Application telemetry** (monitoring system health, token usage, latency, and backend errors), and **Human feedback** (capturing explicit user ratings or escalation requests).
* **C.** System prompt character length, few-shot example count, and Markdown header counts.
* **D.** Local `/tmp/` file sizes, SSH port ping frequency, and C++ compilation times.

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Google Cloud AgentOps principles mandate tracking three complementary metric categories during a canary release:
    1. **Business metrics**: Measures high-level business value and operational outcomes (e.g., payment completion, cart conversion).
    2. **Application telemetry**: Monitors underlying system health, token consumption, response latency, and backend errors.
    3. **Human feedback**: Captures explicit user feedback (e.g., thumbs up/down) and implicit signals (e.g., requests to speak to a human representative).
  * **Why Distractor A fails:** Git commit counts and Dockerfile line limits are source-control metadata, not live production release health metrics.
  * **Why Distractor C fails:** Prompt character length and header counts are static prompt configuration attributes, not live runtime release metrics.
  * **Why Distractor D fails:** Ephemeral `/tmp/` disk sizes and SSH pings do not measure agent reasoning quality, business value, or user sentiment.

---

