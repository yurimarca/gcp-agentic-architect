Section 1 of the exam guide (~13% of the total score) focuses on designing, configuring, and connecting AI agents using Google Cloud's low-code platforms—primarily **Gemini Enterprise Agent Designer**, **Customer Experience (CX) Agent Studio / Conversational Agents (Dialogflow CX)**, and **Agent Search**.

---

### **1.1 Configuring Agentic Workflows and Behavior Using Low-Code Tools**

#### **A. State-Based Workflows: Flows, Pages, Routes, and Event Handlers**
Low-code conversational platforms structure user interactions using a deterministic **finite-state machine** architecture to guarantee predictable dialogue control alongside generative LLM capabilities.

* **Flows**: High-level, modular conversation topics or sub-agent domains (e.g., `BillingFlow`, `SupportFlow`). Flows isolate logic so multiple teams can build components independently. Every agent includes a `Default Start Flow`.
* **Pages**: The core building blocks of the state machine, representing a single active conversational state or checkpoint. At any point in a session, exactly **one page is active**. Pages handle specific objectives (e.g., collecting user credentials, confirming a booking).
* **Transition Routes (State Handlers)**: Control signals that dictate how and when an active page transitions to another page or flow. Routes can be triggered by:
  * **Intent Routes**: Matches user input to a defined intent (e.g., intent `car_rental.reservation_create` triggers transition to page `Pickup Location`).
  * **Condition Routes**: Evaluates boolean logic over session parameters or webhook outputs (e.g., `$session.params.user_tier == "VIP"`).
* **Event Handlers**: Manage unexpected user behavior, system errors, no-match/no-input events, or asynchronous API exceptions to prevent dialogue failure.
* **Page Execution Lifecycle**: When a page becomes active, it executes in a strict deterministic order:
  1. **Entry Fulfillment**: Triggers initial static response messages or webhooks.
  2. **Form Parameter Prefilling**: Copies matching session or intent parameters into required form fields.
  3. **State Handler Evaluation**: Checks active routes and event handlers in order.
  4. **Form Parameter Prompting**: Prompts the user for any missing required form parameters.
  5. **User Input Wait & Reprompt**: Waits for user input to fill remaining parameters and re-evaluates state handlers.

#### **B. In-Console Prompt Templates, System Instructions & Reasoning**
Building low-code agents requires structuring system prompts to balance creative LLM generation with strict enterprise guidelines:

* **System Instructions**: Define persona, domain boundaries, response format (e.g., Markdown vs JSON), tone, and safety constraints directly inside Agent Designer or CX Agent Studio.
* **Few-Shot Prompting**: Supplying a small dataset of example input/output pairs within the prompt to enforce exact output formatting, response styling, and edge-case handling.
* **Chain-of-Thought (CoT) Prompting**: Instructing the model to explicitly step through its reasoning before producing a final answer, reducing hallucinations in multi-step visual/textual tasks.
* **Dynamic Parameter Templating**: Injecting session variables into prompts dynamically (e.g., `{user:name}`, `{session.params.account_id}`) so the agent personalizes answers based on active state.

---

### **1.2 Connecting Enterprise Data to Gemini Enterprise**

#### **A. Grounding in Enterprise Data Sources & Access Control**
Low-code agents must connect directly to internal business systems to deliver factual, permissions-aware responses:

* **Agent Search (formerly Vertex AI Search)**: Serves as the primary enterprise retrieval-augmented generation (RAG) engine, indexing both structured databases and unstructured document stores.
* **Data Store Tools & Handlers**: In CX Agent Studio / Conversational Agents, Data Store Tools enable agents to answer open-ended user Q&A directly from indexed enterprise repositories without building manual flow paths for every query.
* **Permissions-Aware Grounding (ACL Enforcement)**: Gemini Enterprise connects to SaaS tools (Google Drive, SharePoint, Jira, Salesforce, ServiceNow) via native connectors. Search and synthesis strictly enforce original source Access Control Lists (ACLs) and Single Sign-On (SSO) identity so users only receive responses grounded in data they are authorized to view.

#### **B. Ingesting & Processing Unstructured Multimodal Data**
Modern enterprise agentic workflows must handle non-textual data alongside standard documents:

* **Multimodal Ingestion**: Ingesting raw unstructured assets—including images, charts, audio recordings, and videos—into agentic data stores.
* **Native Multimodal Embeddings**: Rather than relying on separate OCR or speech-to-text pipeline dependencies, Gemini models natively process and understand multimodal context (interpreting visuals, audio, and text simultaneously).
* **Information Extraction & Synthesis**: Low-code agents use multimodal retrieval to extract structured metadata (e.g., extracting invoice line items from a PDF image or summarizing key takeaways from a recorded customer call) and synthesize answers across heterogeneous data repositories.

---

### **Exam Strategy Summary for Section 1**

| Topic | Key Exam Focus | Critical Concepts to Master |
| :--- | :--- | :--- |
| **State Machines** | CX Agent Studio / Dialogflow CX | Page execution lifecycle, active page scope, intent vs condition routes, form parameter filling. |
| **Prompt Engineering** | Agent Designer | Combining system instructions, few-shot examples, CoT reasoning, and dynamic state templating. |
| **Data Grounding** | Agent Search & Data Stores | Connecting SaaS connectors, data store tools, enforcing SSO/ACL perimeters, grounding responses. |
| **Multimodal Inputs** | Gemini Multimodal | Processing images, video, and audio directly without separate pre-processing pipelines. |

---

Section 2 of the Google Cloud Professional Agentic Architect Exam guide (~17% of the total score) focuses on **using coding agents to scaffold, build, evaluate, and deploy agentic applications**, configuring **Model Context Protocol (MCP)** servers, and integrating **custom skills and Data Agent Kit (DAK)** tools.

---

### **2.1 Agents CLI & Development Lifecycle (`agents-cli`)**

#### **A. Overview & Skill Injection for Coding Assistants**
**Agents CLI** (`agents-cli`) is the unified command-line toolchain and skills suite designed for AI coding assistants (such as Antigravity CLI, Claude Code, Cursor, and Codex) and human developers. It translates natural language developer prompts into standard Google Cloud agent development workflows, removing context window tax and preventing architectural guesswork.

When developers run `uvx google-agents-cli setup`, it installs the CLI binary and injects **7 context-aware skills** directly into detected coding environments:

| Skill Name | Role & Knowledge Injected |
| :--- | :--- |
| `google-agents-cli-workflow` | Guides the full development lifecycle, code preservation, and model selection. |
| `google-agents-cli-adk-code` | Injects ADK Python API design patterns, tools, orchestration, and callbacks. |
| `google-agents-cli-scaffold` | Controls project creation (`create`), infrastructure enhancements (`enhance`), and version upgrades. |
| `google-agents-cli-eval` | Handles evaluation workflows (datasets, metrics, generation, grading, trajectory comparisons). |
| `google-agents-cli-deploy` | Manages target deployments (Agent Runtime, Cloud Run, GKE, CI/CD pipelines). |
| `google-agents-cli-publish` | Registers deployed Agent Runtime instances with Gemini Enterprise. |
| `google-agents-cli-observability` | Configures Cloud Trace, Cloud Logging, and BigQuery analytics plugins. |

#### **B. Standard Agent Project Structure**
Projects created via `agents-cli create <project-name>` follow a standardized file layout:

* **`app/agent.py`**: The primary entry point defining the root agent instance (`root_agent = LlmAgent(...)` or `Agent(...)`), system instructions, tools, and model configuration.
* **`agents-cli-manifest.yaml`**: Project metadata specifying `agent_directory` (default `app`), initial deployment target, and session storage type.
* **`pyproject.toml` / `uv.lock`**: Manages project dependencies and virtual environment isolation using `uv`.
* **`tests/eval/datasets/basic-dataset.json`**: Baseline evaluation dataset containing prompts and expected context for automated testing.
* **`.env`**: Stores local development credentials (e.g., `GEMINI_API_KEY`) or GCP project references.

#### **C. Development & Lifecycle Commands**
The CLI handles every phase of the agent lifecycle:

1. **Scaffold**: `agents-cli create my-agent --prototype --yes` creates a minimal prototype project without committing to Cloud infrastructure.
2. **Local Testing**: `agents-cli playground` launches an interactive local web interface at `http://localhost:8080` with hot-reloading. Single terminal prompts can be smoke-tested via `agents-cli run "prompt"`.
3. **Enhance Infrastructure**: `agents-cli scaffold enhance -d cloud_run` injects Dockerfiles, Terraform IaC, and Cloud Build CI/CD configurations into an existing prototype.
4. **Evaluation**: `agents-cli eval run` executes test datasets against local or deployed agent endpoints, grading outputs and comparing trajectory traces.
5. **Deployment**: `agents-cli deploy` builds container images and deploys them to the designated target (`agent_runtime`, `cloud_run`, or `gke`).

---

### **2.2 Model Context Protocol (MCP) Architecture & Integration**

#### **A. Core Architecture & Transports**
The **Model Context Protocol (MCP)** is an open standard (using JSON-RPC 2.0) that decouples agent reasoning logic from tool execution. Instead of hardcoding bespoke API integrations into prompt templates, agents connect to external systems via standardized MCP servers.

MCP architecture consists of:
* **MCP Host**: The application environment containing the LLM (e.g., Agent Runtime, IDE, or custom runner).
* **MCP Client**: Translates LLM function calls into MCP JSON-RPC protocol requests.
* **MCP Server**: External process or remote service exposing **Tools** (executable functions), **Resources** (read-only data/files), and **Prompts** (prebuilt interaction templates).
* **Transport Layer**:
  * **Standard I/O (`stdio`)**: Used for local subprocesses (e.g., running npm/npx packages locally). High-speed, zero-network latency, but non-scalable in cloud environments.
  * **Server-Sent Events (SSE) / Streamable HTTP**: Used for remote cloud services over HTTP/HTTPS. Essential for Cloud Run/GKE deployments requiring stateless scaling and IAM bearer token authentication.

#### **B. Integration Patterns in Agent Development Kit (ADK)**
ADK supports three primary MCP integration patterns:

1. **Direct MCP Tool Integration (`McpToolset`)**: The agent acts as an MCP client. It dynamically connects to an MCP server, discovers available tool schemas via `list_tools`, and exposes them to the agent's tool list.
   ```python
   from google.adk.agents import LlmAgent
   from google.adk.tools.mcp_tool import McpToolset
   from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPConnectionParams

   root_agent = LlmAgent(
       model="gemini-2.5-flash",
       name="sales_assistant",
       tools=[
           McpToolset(
               connection_params=StreamableHTTPConnectionParams(
                   url="https://mcp-db.example.com/sse",
                   headers={"Authorization": f"Bearer {token}"}
               ),
               tool_filter=["query_sales_db"]  # Principle of least privilege
           )
       ]
   )
   ```
2. **Agent-Exposed MCP Server (`to_mcp_server`)**: Compiles an autonomous ADK agent into an MCP server, allowing external clients (Claude Code, IDEs, or other agents) to invoke it as a tool.
3. **Specialized Sub-Agent Delegation (`AgentTool`)**: Wraps a child `LlmAgent` as a tool inside a parent orchestrator agent, isolating intermediate reasoning loops and preventing context window bloat.

#### **C. Tool Selection Trade-offs Matrix**
Choosing the right tool type is critical for performance, context window management, and cost optimization on the exam:

| Dimension | Built-in Tools | Custom Function Tools | MCP Tools (`McpToolset`) | Agent-as-Tool (`AgentTool`) |
| :--- | :--- | :--- | :--- | :--- |
| **Best For** | Standard web search (`google_search`) or code execution. | Proprietary business logic or domain calculations. | Pre-existing ecosystem integrations (Databases, GitHub, SaaS). | Complex multi-step reasoning requiring trial-and-error. |
| **Context Window Impact** | Minimal. | Low to Medium (schema derived from docstring/type hints). | **High Context Bloat** (all schemas & raw DB payloads enter main context). | **Zero Context Bloat** (sub-agent execution stays isolated in its own loop). |
| **Model Tiering** | Single model. | Single model. | Single model handles all schemas. | **Enables Model Tiering** (e.g., Gemini Pro for orchestrator, Gemini Flash for sub-agent). |
| **Maintenance** | Maintained by Google/ADK team. | Maintained by developer. | Maintained by open-source community/server host. | Maintained by developer. |

#### **D. Managed vs. Self-Hosted MCP Servers**
* **Google Cloud Managed MCP Servers**: Fully managed remote MCP endpoints provided by Google (e.g., Google SecOps, Google Threat Intelligence, Knowledge Catalog remote MCP). They integrate natively with IAM and Cloud Audit Logs without operational overhead.
* **Self-Hosted MCP Servers (e.g., MCP Toolbox for Databases)**: Open-source MCP servers deployed as containerized services on Cloud Run within a private VPC. Handles connection pooling, credentials mounting from Secret Manager, and queries across 16+ database engines (AlloyDB, Spanner, Cloud SQL).

---

### **2.3 Custom Skills & Data Agent Kit (DAK)**

#### **A. ADK Agent Skills Specification**
An **Agent Skill** is a modular, self-contained unit of instructions and resources that an agent can load on demand to minimize context window consumption. Skills follow a 3-level hierarchy based on the open Agent Skill specification:

* **L1 (Metadata / Frontmatter)**: Defines skill `name` and `description` in `SKILL.md` frontmatter for initial discovery.
* **L2 (Instructions)**: The core step-by-step instructions loaded into context only when the agent decides to trigger the skill.
* **L3 (Resources)**: Supplemental assets loaded on demand:
  * `references/`: Extended guidance or workflows.
  * `assets/`: Database schemas, API specs, or templates.
  * `scripts/`: Executable code run by the agent runtime.

In Python, skills are loaded into agents using `SkillToolset`:
```python
import pathlib
from google.adk.agents import Agent
from google.adk.skills import load_skill_from_dir
from google.adk.tools import skill_toolset

weather_skill = load_skill_from_dir(pathlib.Path("./skills/weather_skill"))
root_agent = Agent(
    model="gemini-2.5-flash",
    name="skill_agent",
    tools=[skill_toolset.SkillToolset(skills=[weather_skill])]
)
```

#### **B. Data Agent Kit (DAK)**
**Data Agent Kit** is an open-source extension and skill pack for data engineers and data scientists working in IDEs (VS Code, Antigravity) or CLI coding agents. It bridges coding agents to 20+ Google Data Cloud services (BigQuery, Spanner, Dataproc, Cloud Storage, dbt) by equipping agents with pre-built data skills and MCP toolboxes. This allows developers to generate SQL, construct ML models, or deploy ETL data pipelines using natural language intent without manually pasting schema metadata into prompt windows.

---

### **Exam Strategy Summary for Section 2**

| Topic | Key Exam Focus | Critical Concepts to Master |
| :--- | :--- | :--- |
| **`agents-cli` Workflow** | Agent Development Lifecycle | CLI commands (`create --prototype`, `scaffold enhance`, `playground`, `eval run`, `deploy`), 7 injected skills, `app/agent.py` project structure. |
| **MCP Architecture** | Connectivity & Transports | Client vs Host vs Server, `stdio` (local development) vs `sse`/`StreamableHTTPConnectionParams` (cloud remote). |
| **ADK MCP Integration** | Code implementation | `McpToolset`, `tool_filter` security, environment-aware connections (`K_SERVICE` detection). |
| **Architectural Trade-offs** | Tool Selection | Comparing context bloat, model load, token costs, and model tiering across Built-in, Function, MCP, and `AgentTool`. |
| **Custom Skills & DAK** | Context Optimization | 3-level Skill structure (L1/L2/L3), `SkillToolset`, Data Agent Kit MCP integration for database workflows. |

---

Section 3 is the largest domain on the exam (~33% of the total score). It tests your ability to write custom agent code using the **Agent Development Kit (ADK)**, engineer persistent state and memory systems, architect RAG/GraphRAG pipelines, and implement enterprise multi-agent protocols (`A2A`, `MCP`).

---

### **3.1 Multi-Agent Workflows & Orchestration in ADK**

#### **A. Deterministic Workflow Agents (Template Workflows)**
ADK provides deterministic workflow classes that orchestrate sub-agents using fixed code logic rather than consulting an LLM for routing decisions:

1. **`SequentialAgent`**: Executes sub-agents in a strict linear order.
   * **State Handling**: Passes the exact same `InvocationContext` to all sub-agents, allowing earlier agents to write outputs to `session.state` (via `output_key`) and later agents to read them directly using `{var}` instruction templating.
2. **`ParallelAgent`**: Executes sub-agents concurrently to minimize execution latency.
   * **Requirements**: Sub-agents must be completely independent. Sub-agents write to distinct keys in `session.state`, which a downstream "Gather" agent in a `SequentialAgent` pipeline aggregates.
3. **`LoopAgent`**: Repeatedly executes a sequence of sub-agents until a termination condition is met.
   * **Preventing Infinite Loops**: Loops must define either `max_iterations` or rely on a sub-agent triggering an escalation event (`EventActions(escalate=True)`) when quality thresholds or state conditions are satisfied.

#### **B. Dynamic & Reasoning Orchestration**
* **Coordinator / Dispatcher Pattern**: A central `LlmAgent` analyzes user requests and dynamically routes sub-tasks to specialized sub-agents. Achieved via **LLM-Driven Delegation** (transferring control based on sub-agent descriptions) or **Explicit Invocation (`AgentTool`)** (wrapping a child agent as a tool inside the coordinator).
* **Agent Routing (`RoutedAgent`)**: Uses an explicit routing function to select exactly *one* sub-agent per invocation based on input complexity, A/B testing rules, or runtime errors. Supports automatic fallback if the primary agent fails before producing output.
* **Custom Agents (`BaseAgent`) & Graph Workflows**: Developers can extend `BaseAgent` and override `_run_async_impl` to build custom conditional control loops. In ADK 2.0+, graph-based workflows supersede template workflows for complex branching topologies.

---

### **3.2 Conversational Context, State, and Memory Management**

#### **A. Short-Term Memory: Sessions & State Namespaces**
A **Session** represents a single interaction thread containing a chronological sequence of `Event` objects (user inputs, LLM responses, tool calls). Short-term data is tracked programmatically in `session.state`.

ADK enforces **4 state namespaces** via key prefixes to dictate variable lifetime and visibility:

| Namespace Prefix | Persistence Scope | Lifetime | Exam Use Case Example |
| :--- | :--- | :--- | :--- |
| **`temp:`** | Single Invocation (Current Turn) | **Discarded immediately** after the agent completes the turn. | Intermediate calculations, raw API responses, or flags passed between tool calls. |
| **No Prefix** | Session-Scoped | Persists across turns; lost when session ends. | Tracking task progress (`current_booking_step`) or active intent. |
| **`user:`** | User-Scoped | Persists **across all sessions** for a specific `user_id`. | Persistent user preferences (language, dark mode, membership tier). |
| **`app:`** | Application-Scoped | Global across **all users and all sessions**. | Global endpoints (`app:api_url`), version flags, or system prompts. |

* **Storage Backends**: Production deployments externalize short-term state to `DatabaseSessionService` (Cloud SQL / AlloyDB), `Firestore`, `Memorystore for Redis`, or `Agent Platform Sessions` to survive container restarts and enable horizontal scaling.

#### **B. Long-Term Memory: Memory Bank & RAG Memory**
While sessions track active conversations, long-term memory provides searchable knowledge across past interactions:

* **`VertexAiMemoryBankService`**: Connects agents to **Agent Platform Memory Bank**. Asynchronously extracts, refines, and consolidates facts from completed sessions into structured, persistent memories. Supports **similarity search**, TTL auto-expiration, memory revision tracking, and identity-isolated retrieval.
* **`VertexAiRagMemoryService`**: Stores raw, unsummarized conversation transcripts in Knowledge Engine / RAG Engine for vector-similarity retrieval.
* **`BaseMemoryService` API Operations**: `add_session_to_memory` (ingests full session), `add_events_to_memory` (ingests recent turn deltas), `add_memory` (direct fact injection), and `search_memory` (queries stored facts).

---

### **3.3 Vector Search, RAG Engine, & GraphRAG Architectures**

#### **A. RAG Engine Deployment Modes**
Gemini Enterprise Agent Platform RAG Engine supports two primary deployment modes:

1. **Serverless Mode (Default)**: Automatically provisions a Vector Search 2.0 collection in the project for embedding indexing and similarity matching. Offers full visibility over vector database costs without managing infrastructure, but **does not support Customer-Managed Encryption Keys (CMEK)**.
2. **Spanner Mode**: Allocates dedicated Google Cloud Spanner infrastructure for RAG metadata and operations. Required for enterprise workloads demanding **CMEK compliance** or dedicated database isolation.

#### **B. GraphRAG with Spanner Graph**
GraphRAG combines vector similarity search with knowledge graph queries in **Spanner Graph** to capture complex relationships across heterogeneous enterprise data:

* **Data Ingestion Subsystem**: Cloud Storage uploads trigger Pub/Sub → Cloud Run functions that chunk text (Layout Parser / TextSplitter), generate multimodal embeddings via Gemini Embedding APIs, and write both property graph nodes/edges and vector embeddings directly into Spanner Graph.
* **Search & Retrieval Subsystem**:
  1. **Keyword Search**: SQL `LIKE` clauses for exact category/location matching.
  2. **Semantic Vector Search**: Cosine distance similarity matching over embeddings.
  3. **Hybrid Search**: Executes keyword and semantic search in parallel and merges results using **Reciprocal Rank Fusion (RRF)**.
  4. **Reranking**: Scores and filters graph traversal nodes using the **Agent Search Ranking API** before prompt synthesis.

---

### **3.4 Agent Identity, Agent Registry, and Agent2Agent (A2A) Protocol**

#### **A. Agent Identity & Security Baseline**
Agent Identity assigns a unique, strongly-attested cryptographic identity to every agent based on the **SPIFFE standard**:
* **Format**: `spiffe://agents.global.org-ORGANIZATION_ID.system.id.goog/resources/aiplatform/projects/.../reasoningEngines/AGENT_ID`.
* **Credential Protection**: Auto-provisions X.509 certificates valid for 24 hours. Context-Aware Access (CAA) policies enforce **mTLS** binding for first-party GCP calls and **Demonstrating Proof of Possession (DPoP)** across Agent Gateway, rendering intercepted tokens unreplayable.
* **Auth Manager**: Centralized credential broker managing 3-legged OAuth 2.0 tokens (user-delegated authority) and API keys/client secrets (agent's own authority).

#### **B. Agent Registry**
The central organizational directory that inventories approved agents, remote MCP servers, tools, and standalone skills. Agent Gateway verifies that outbound agent calls target endpoints registered in Agent Registry before allowing traffic.

#### **C. Agent2Agent (A2A) Protocol**
An open standard protocol that enables independent AI agents to communicate and collaborate across network boundaries, heterogeneous frameworks, and languages:
* **Architecture**: The provider agent exposes its capability via an `A2AServer`; the consumer agent connects via a `RemoteA2aAgent` client proxy.
* **Core Capabilities**: Supports streaming thought/reasoning traces across network boundaries, handling long-running tool operations without HTTP timeouts, and passing binary file artifacts.
* **A2A Security**: Secured via extended agent cards and OpenID Connect (OIDC) identity tokens validated using Google Cloud IAM.

---

### **Exam Strategy Summary for Section 3**

| Topic | Key Exam Focus | Critical Concepts to Master |
| :--- | :--- | :--- |
| **ADK Workflow Agents** | Multi-Agent Design Patterns | `SequentialAgent` (shared context), `ParallelAgent` (independent execution), `LoopAgent` (`max_iterations` / escalation exit conditions). |
| **State Management** | State Namespaces | `temp:` (turn-only), no-prefix (session), `user:` (cross-session user prefs), `app:` (global config), `{var}` templating. |
| **Long-Term Memory** | Memory Bank vs RAG | `VertexAiMemoryBankService` (LLM fact extraction/consolidation) vs `VertexAiRagMemoryService` (raw transcript retrieval). |
| **RAG & GraphRAG** | Vector Stores & Spanner Graph | Serverless vs Spanner mode (CMEK), Hybrid search with Reciprocal Rank Fusion (RRF), Agent Search Ranking API. |
| **Identity & Protocols** | Enterprise Governance | SPIFFE IDs, mTLS/DPoP double-binding, Agent Gateway, Agent Registry, A2A protocol (`A2AServer` / `RemoteA2aAgent`). |

---

Section 4 of the exam guide (~22% of the exam) covers **evaluating, deploying, scaling, and observing agentic workflows** in development and production environments.

---

### **4.1 Evaluating Agents in Development and Production**

#### **A. Golden Datasets & Ground Truth Rubrics**
Testing nondeterministic generative agents requires moving beyond traditional rigid unit tests to **evaluations as unit tests**.
* **Golden Dataset**: A curated benchmark spreadsheet or JSON file containing historical user prompts, ideal human-written answers, and expected tool-invocation sequences.
* **Dataset Stabilization**: Evaluation criteria, ground-truth answers, and test cases must be stabilized early in development to ensure test comparability across prompt iterations or model updates.

#### **B. Evaluation Lenses & Core Metrics**
CI/CD pipelines evaluate agent decision-making across two distinct lenses:

1. **Evaluating Trajectory and Tool Use (Reasoning Steps)**:
   * **Exact Match / In-Order Match**: Verifies whether the agent called tools in the required sequential order (e.g., calling `Lookup_Order` before `Process_Refund`).
   * **Precision**: Measures whether the agent called unnecessary tools, avoiding superfluous context or API overhead.
   * **Recall**: Checks whether the agent missed required tool calls needed to satisfy the request.
2. **Evaluating Final Output (Autoraters & LLM-as-a-Judge)**:
   * **Groundedness**: Ensures responses are strictly derived from tool context without hallucinations.
   * **Fulfillment / Relevance**: Verifies that the answer fully satisfies the user's primary objective.
   * **Tone & Safety**: Assesses brand alignment, politeness, and adherence to safety guardrails.

#### **C. Evaluation Frameworks & Tooling (`agents-cli eval`)**
The `agents-cli eval` command suite provides CLI-driven evaluation workflows:
* **`agents-cli eval generate`**: Dispatches prompts from an evaluation dataset in parallel across agent sessions to produce execution traces.
* **`agents-cli eval grade`**: Scores generated traces against specified metrics (e.g., `grounding`, `final_response_quality`) using an autorater.
* **`agents-cli eval run`**: Chains `generate` and `grade` in a single command, saving results to `artifacts/grade_results/`.
* **`agents-cli eval compare`**: Performs a side-by-side diff between baseline and candidate result JSON files.
* **`agents-cli eval analyze`**: Identifies failure clusters and groups common loss patterns.
* **`agents-cli eval optimize`**: Uses the GEPA framework (`adk optimize`) to iteratively refine system prompts against target evaluation metrics.

#### **D. Automated Quality Gates with Cloud Build**
Continuous integration pipelines enforce automated quality gates before code is deployed:
1. **Trigger & Temporary Deployment**: Cloud Build deploys candidate agent code to a Staging environment.
2. **Golden Dataset Execution**: Pipeline scripts pass test cases through `agents-cli eval run`.
3. **Threshold Gate Check**: The pipeline evaluates metrics against strict thresholds (e.g., `if groundedness_score < 4.0: exit(1)`). If the score falls below threshold, Cloud Build immediately halts deployment.

---

### **4.2 Deploying, Scaling, and Observing Production Workloads**

#### **A. Selecting the Optimal Deployment Target**
When deploying agents, architects choose among three primary deployment targets based on control, language, and operational overhead:

| Dimension | Agent Runtime | Cloud Run | GKE (Google Kubernetes Engine) |
| :--- | :--- | :--- | :--- |
| **Best For** | Python-native ADK agents needing a fully managed, serverless platform. | Containerized agents requiring language flexibility, serverless autoscaling to zero, or custom runtimes. | Enterprise microservices requiring deep infrastructure control, stateful pods, or specialized hardware. |
| **Scaling** | Serverless with sub-second starts. | Event-driven request scaling down to zero. | Kubernetes Pod Autoscaler / Node Autoscaler. |
| **Deployment Command** | `agents-cli deploy -d agent_runtime` | `agents-cli deploy -d cloud_run` | `agents-cli deploy -d gke` |
| **Networking** | Private Service Connect (PSC) interfaces. | Direct VPC Egress / Serverless VPC Connectors. | Native VPC pod subnets / External Gateway. |

#### **B. Canary Deployments & Traffic Splitting**
To minimize risk when releasing new agent versions, teams use canary deployments:
* **Traffic Division**: Splits live traffic between a stable control version (e.g., 90% to v1) and an unproven treatment version (10% to v2).
* **Multi-Dimensional Monitoring**: Teams evaluate business metrics (cart conversions, resolution rate), application telemetry (latency, token spend), and end-user feedback.
* **Zero-Downtime Rollback**: If Cloud Monitoring detects latency spikes or error anomalies in v2, Agent Runtime or Cloud Run instantly reroutes 100% of traffic back to v1 without downtime.

#### **C. Observability with OpenTelemetry & Cloud Trace**
Because AI agents execute non-deterministic reasoning loops, standard error logging is insufficient:
* **OpenTelemetry (OTel) Spans**: Every user turn, LLM call, and tool execution is wrapped in nested OTel spans. The root span represents the overall transaction, while child spans capture intermediate tool calls and model calls.
* **Troubleshooting Reasoning Loops**: Traces expose structural logic failures such as infinite tool cascades (repeating reasoning/tool cycles) and silent failures (polite user response despite backend tool exception).
* **BigQuery Agent Analytics**: Deployments can stream full prompt-response logs, token usage, and conversation telemetry directly to BigQuery for offline analytics and cost optimization.

---

### **Exam Strategy Summary for Section 4**

| Topic | Key Exam Focus | Critical Concepts to Master |
| :--- | :--- | :--- |
| **Agent Evaluation** | Golden Datasets & Metrics | Trajectory/tool use (Exact match, Precision, Recall) vs Final response quality (Groundedness, Fulfillment, Tone). |
| **CLI Evals** | `agents-cli eval` | `run`, `generate`, `grade`, `compare`, `analyze`, `optimize`. |
| **CI/CD Quality Gates** | Cloud Build | Staging eval execution, threshold checks (`exit(1)` on score drop). |
| **Deployment Targets** | Runtime Selection | Agent Runtime (fully managed Python) vs Cloud Run (serverless container) vs GKE (custom k8s). |
| **Release Management** | Canary Deployments | Traffic splitting (90/10), tracking business/telemetry/feedback metrics, instant rollback. |
| **Observability** | OpenTelemetry & Cloud Trace | Nested OTel spans, root vs child spans, detecting tool cascades & silent errors, BigQuery analytics. |

---
Section 5 of the exam guide (~15% of the total score) focuses on implementing enterprise governance, cryptographic identity, perimeter defense, and runtime content safety for autonomous agents across Google Cloud.

---

### **5.1 Enterprise Governance, Agent Identity, and Access Boundaries**

#### **A. Principal Access Boundary (PAB) Policies**
Principal Access Boundary (PAB) policies enforce explicit resource boundaries directly on principal sets (such as service accounts, agent identities, or workload identity pools):

* **Mechanism**: While standard IAM allow/deny policies attach to resources to specify *who* can access them, PAB policies attach to principal sets to define the complete universe of resources that those principals are *eligible* to access.
* **Evaluation Properties**: PAB policies are **additive** (eligible resources represent the union of all PAB rules bound to a principal) and **fail-closed** (if IAM encounters an evaluation error, access is immediately blocked).
* **Conditional Policy Bindings**: PAB bindings support attribute conditions such as `principal.type` (e.g., restricting a policy strictly to `iam.googleapis.com/ServiceAccount` or agent identities) and `principal.subject` to fine-tune boundary scopes.
* **Use Case**: Containing the blast radius of autonomous agents by ensuring that even if an agent is hijacked via prompt injection, it physically cannot access resources or projects outside its defined PAB boundary.

#### **B. SPIFFE-Based Agent Identity & Cryptographic Baseline**
Agent Identity provides a strongly attested, non-reusable cryptographic identity assigned to each deployed agent instance:

* **SPIFFE ID Standard**: Agent identities are formatted according to the SPIFFE open standard, mapping directly to the resource URI hosting the agent:
  `spiffe://agents.global.org-ORGANIZATION_ID.system.id.goog/resources/aiplatform/projects/PROJECT_NUMBER/locations/LOCATION/reasoningEngines/AGENT_ID`.
* **Principal Representation in IAM**: When used in IAM allow/deny policies, the principal uses the `principal://` format.
* **Cryptographic Credentials & CAA**: Auto-provisions X.509 certificates valid for 24 hours. Context-Aware Access (CAA) policies enforce **mutual TLS (mTLS)** for first-party Google Cloud API calls and **Demonstrating Proof of Possession (DPoP)** across Agent Gateway, rendering certificate-bound tokens unreplayable outside the trusted runtime container.
* **Identity Lifecycle**: If an agent is deleted and re-created (even with identical code and display name), it receives a new resource ID and a new SPIFFE principal identifier. IAM bindings bound to the old principal become inactive and must be explicitly updated or managed via project-scoped `principalSet` bindings.

#### **C. Agent Identity Auth Manager & Central Registries**
* **Agent Identity Auth Manager**: Operates as a centralized credential vault and token broker. It handles 3-legged OAuth 2.0 (user-delegated authority for SaaS tools like Jira/GitHub) and API keys/client secrets (agent's own authority). Credentials are encrypted in the auth manager and decrypted at Agent Gateway, ensuring agents never process raw secrets in prompt memory.
* **Agent Registry**: The central organizational directory cataloging approved agents, remote MCP servers, tools, and Google Cloud endpoints. Agent Gateway verifies all outbound calls against Agent Registry.

---

### **5.2 Network Security, Agent Gateway, and Data Perimeters**

#### **A. Agent Gateway Architecture & Deployment Modes**
Agent Gateway serves as the centralized network enforcement point and policy proxy for all agentic traffic:

1. **Client-to-Agent (Ingress Mode)**: Frontends agent runtimes (such as Agent Runtime) to control client tool connections (e.g., Cursor, Claude Code, CLI), enforcing IAP authentication, Model Armor prompt screening, and rate limits before forwarding traffic to the agent.
2. **Agent-to-Anywhere (Egress Mode)**: Intercepts outbound calls originating from agents targeting external tools, MCP servers, or remote agents. Validates target destinations against Agent Registry and enforces IAM egress permissions.

#### **B. Policy Enforcement Chain & API Allowlisting**
When an agent initiates an outbound call through Agent Gateway in egress mode, traffic passes through a mandatory 5-step enforcement sequence:
1. **Interception**: Agent Gateway intercepts the outbound request.
2. **IAM & IAP Policy Check**: Verifies that the agent's SPIFFE ID holds `iap.resources.egressViaIAP` permissions.
3. **Agent Registry Verification**: Confirms the target destination is cataloged in Agent Registry or backed by an explicit IAM policy targeting the URL.
4. **Content & Semantic Inspection**: Evaluates Model Armor templates (prompt injection/data leakage) and Semantic Governance Policies (natural language constraints).
5. **Request Forwarding**: Forwards approved requests to the destination.

* **Allowlisting Essential APIs**: Because Agent Gateway defaults to a strict *default deny* posture, developers must allowlist essential platform endpoints (e.g., `aiplatform.googleapis.com`, `logging.googleapis.com`, `telemetry.googleapis.com`, `secretmanager.googleapis.com`) in Agent Registry to avoid runtime initialization failures (HTTP 498 errors).

#### **C. Data Perimeters and VPC Service Controls (VPC-SC)**
* **Exfiltration Protection**: VPC Service Controls establishes a security forcefield around Google Cloud resources (Cloud Storage, BigQuery, AlloyDB, Agent Runtime), preventing agents from exfiltrating data to external untrusted endpoints.
* **Agent Private Connectivity**:
  * **Agent Runtime Egress**: Connects to customer VPC networks via **Private Service Connect (PSC) interfaces** attached to a designated subnet.
  * **Cloud Run Egress**: Uses **Direct VPC Egress** to route all outbound agent traffic through private VPC subnets.
  * **Secure Web Proxy**: Acts as an explicit HTTP(S) proxy within the VPC to inspect and filter outbound internet traffic initiated by agents.

---

### **5.3 Guardrails, Model Armor, and Conversation Protection**

#### **A. Model Armor Filtering Suite**
Model Armor provides real-time, inline inspection and sanitization of user prompts and model responses:

| Filter Category | Scope & Detection Mechanism | Key Exam Configuration Details |
| :--- | :--- | :--- |
| **Responsible AI Safety** | Filters hate speech, harassment, sexually explicit, and dangerous content. | Configurable confidence thresholds (`HIGH`, `MEDIUM_AND_ABOVE`, `LOW_AND_ABOVE`). |
| **Prompt Injection & Jailbreak** | Detects adversarial manipulation, system prompt overrides, and jailbreak payloads. | Requires input payloads to contain **at least 3 words** to trigger evaluation. |
| **Sensitive Data Protection (SDP)** | Redacts, tokenizes, or masks PII, credit cards, SSNs, and API keys. | Supports **Basic configuration** (predefined infotypes) and **Advanced configuration** (custom SDP inspection/de-identification templates). |
| **Malicious URL Detection** | Scans extracted URLs in prompts and outputs for phishing/malware domains. | Scans up to the first **256 URLs** per payload. |

#### **B. Template Decoupling & Enforcement Modes**
* **Decoupling Input vs. Output Templates**: Best practices dictate creating separate Model Armor templates for user prompts (focused on prompt injection and PII ingestion) and model responses (focused on data leakage, toxic content, and malicious URLs).
* **Enforcement Types**:
  * **`Inspect only`**: Evaluates policy violations and writes `SanitizeOperationLogEntry` audit logs to Cloud Logging without blocking traffic. Ideal for initial baseline testing and dry runs.
  * **`Inspect and block`**: Actively blocks non-compliant prompts before reaching the LLM and drops non-compliant model responses before reaching the user.
* **Model Armor Floor Settings**: Establishes mandatory baseline security thresholds enforced across all projects and templates in an organization.

#### **C. Human-in-the-Loop (HITL) & Secure Intermediaries**
* **Secure Intermediaries Pattern**: Agents should never manage credentials or establish direct database connections. Tool execution should route through secure backend intermediaries (Cloud Run / Cloud Functions / MCP Servers) that validate session tokens, fetch API keys from Secret Manager at runtime, and enforce row-level database access control.
* **ADK Callbacks & Policy Engines**: Framework-level guardrails using `before_model_callback` or custom `BasePolicyEngine` plugins enforce Human-in-the-Loop (HITL) confirmations before executing high-risk tool operations (e.g., executing financial transfers or non-refundable bookings).

---

### **Section 5 Exam Strategy Summary**

| Topic | Key Exam Focus | Critical Concepts to Master |
| :--- | :--- | :--- |
| **PAB Policies** | Principal Scope Restrictions | Additive, fail-closed evaluation, principal set bindings, `principal.type` conditions. |
| **Agent Identity** | Cryptographic Authentication | SPIFFE IDs, X.509 certs, mTLS + DPoP token binding, identity replacement on re-deployment. |
| **Agent Gateway** | Network Governance | Ingress (Client-to-Agent) vs Egress (Agent-to-Anywhere), 5-step policy chain, platform API allowlisting. |
| **Model Armor** | Real-Time Guardrails | Decoupled input/output templates, 3-word minimum for prompt injection, SDP basic vs advanced, `Inspect only` vs `Inspect and block`. |
| **Network Isolation** | VPC-SC & Connectivity | VPC Service Controls data perimeters, PSC interfaces for Agent Runtime, Direct VPC Egress for Cloud Run, Secure Web Proxy. |

---