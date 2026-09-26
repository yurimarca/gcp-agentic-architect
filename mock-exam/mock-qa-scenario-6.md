Here are **5 realistic, scenario-based multiple-choice exam questions** built directly on **Scenario 6 (Automated CI/CD Evaluation Gate with Cloud Build)**, focusing on `agents-cli eval` workflows, trajectory vs. output metrics, golden datasets, Cloud Build quality gates, and automated prompt optimization.

---

### **Question 1 (Domain 4 - `agents-cli eval` CLI Suite)**

**Context:** A digital publishing company is setting up an automated evaluation step inside a CI/CD pipeline for its news-summarization agent. The pipeline needs to execute a single CLI command that dispatches prompts from a benchmark dataset, records agent tool-execution trajectories, grades final outputs against autorater metrics, and exports the structured results to a JSON file.

**Goal:** Select the correct `agents-cli` command to run both trajectory generation and autorater grading in a single unified execution step.

**Which command should you execute in the pipeline script?**

* **A.** `agents-cli eval run --dataset tests/eval/datasets/news-golden.json --output artifacts/grade_results.json`
* **B.** `gcloud ai models eval create --dataset gs://news-bucket/news-golden.csv`
* **C.** `agents-cli playground --auto-grade --dataset news-golden.json`
* **D.** `agents-cli deploy --d cloud_run --force-eval`

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** In the `agents-cli eval` toolchain, **`agents-cli eval run`** chains both generation (`agents-cli eval generate`) and grading (`agents-cli eval grade`) in a single command. It runs test prompts against the agent, evaluates reasoning steps/outputs against specified metrics, and exports the results to an output artifact file.
  * **Why Distractor B fails:** `gcloud ai models eval` is a legacy command for evaluating static Vertex AI AutoML/custom models; it does not execute ADK agent trajectories, tool calls, or `agents-cli` evaluation frameworks.
  * **Why Distractor C fails:** `agents-cli playground` launches an interactive local browser UI for manual developer testing; it is not a headless command designed for automated CI/CD pipelines.
  * **Why Distractor D fails:** `agents-cli deploy` handles container image building and deployment to target runtimes; it does not execute evaluation datasets or grade metrics.

---

### **Question 2 (Domain 4 - Cloud Build Quality Gates & Pipeline Enforcement)**

**Context:** A publishing team configures a Cloud Build CI/CD pipeline triggered on every pull request. The pipeline temporarily deploys the candidate agent to a Staging environment and executes `agents-cli eval run`. 

**Goal:** Configure Cloud Build to automatically halt the deployment pipeline and block the pull request if the agent's `groundedness` score falls below `4.0` out of `5.0`.

**Constraints:**
* Must enforce an automated quality gate without human intervention.
* The build pipeline must return a non-zero exit code (`exit 1`) when quality thresholds are violated.

**Which build configuration step should you implement in `cloudbuild.yaml`?**

* **A.** Include a post-evaluation build step script that parses the resulting `grade_results.json` file, evaluates `if groundedness_score < 4.0`, and explicitly executes `exit 1` to fail the build.
* **B.** Deploy Model Armor in `Inspect only` mode on the Staging environment and configure Cloud Logging to send email notifications.
* **C.** Set `ALLOW_FAILED_EVALS=true` in `agents-cli-manifest.yaml` and rely on manual reviewer approval in GitHub.
* **D.** Configure an IAM Policy Binding checking `roles/cloudbuild.builds.editor` on the pull request author.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Cloud Build quality gates rely on step exit codes. By adding a post-evaluation script step that inspects the generated `grade_results.json` metric values and returns a non-zero status (`exit 1`) when `groundedness < 4.0`, Cloud Build immediately halts the pipeline, preventing ungrounded candidate code from merging or deploying to production.
  * **Why Distractor B fails:** Model Armor in `Inspect only` mode logs findings to Cloud Logging without blocking requests or failing CI/CD build pipelines.
  * **Why Distractor C fails:** Setting flags to allow failed evals and relying on manual review removes automated pipeline enforcement and risks deploying ungrounded models to production.
  * **Why Distractor D fails:** IAM roles grant build execution permissions; they do not evaluate model quality metrics or enforce threshold gates.

---

### **Question 3 (Domain 4 - Trajectory vs. Final Output Evaluation Metrics)**

**Context:** The news-summarization agent follows a multi-step reasoning workflow: `Search_Article_Database` → `Extract_Full_Text` → `Generate_Summary`. During testing, developers notice that candidate prompt changes sometimes cause the agent to skip `Extract_Full_Text` and attempt to summarize short search snippets directly, resulting in incomplete summaries.

**Goal:** Select the evaluation lens and metric combination that specifically detects when required intermediate tool-invocation steps are skipped or called out of order.

**Which evaluation approach should you configure?**

* **A.** Evaluate **Trajectory and Tool Use** using **Tool Sequence Match (In-Order Match)** and **Tool Recall** metrics.
* **B.** Evaluate **Final Output** using `ROUGE-L` text overlap scores against historical human summaries.
* **C.** Attach a Model Armor template configured with Sensitive Data Protection (SDP) infotypes.
* **D.** Store intermediate tool names in the `user:` state namespace and inspect session history manually.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Agent evaluation consists of two distinct lenses: (1) **Trajectory and Tool Use** (evaluating reasoning steps) and (2) **Final Output** (evaluating the final response). Detecting skipped or out-of-order tool calls requires inspecting the trajectory using **Tool Sequence Match / Exact Match** (verifying execution order) and **Tool Recall** (verifying all required tools were called).
  * **Why Distractor B fails:** Evaluating only the final output with ROUGE-L checks surface text similarity; it completely misses underlying reasoning trajectory failures and tool-skipping logic bugs.
  * **Why Distractor C fails:** Model Armor inspects prompt injection and PII; it does not evaluate tool execution trajectories or metric sequences.
  * **Why Distractor D fails:** Storing temporary tool names in the `user:` state namespace pollutes long-term user memory and requires manual inspection rather than automated CI/CD metric evaluation.

---

### **Question 4 (Domain 4 - Golden Datasets & Benchmark Stabilization)**

**Context:** A junior developer attempts to fix failing evaluation tests by modifying the user prompts inside the `tests/eval/datasets/news-golden.json` test file whenever a candidate agent update fails in Cloud Build. Over time, evaluation pass rates appear high, but production users report severe quality regressions.

**Goal:** Restore sound AgentOps evaluation practices and ensure evaluation trends accurately measure model performance over time.

**Constraints:**
* Test cases must provide a stable, objective baseline across prompt iterations and model updates.

**Which AgentOps best practice should the team enforce?**

* **A.** Freeze and stabilize the **Golden Dataset** test prompts and expected ground-truth references so benchmark test cases remain static across candidate code and prompt iterations.
* **B.** Delete the golden dataset and evaluate candidate agents live against 100% of production traffic using A/B testing.
* **C.** Re-generate the golden dataset dynamically on every git commit using `agents-cli create --prototype`.
* **D.** Remove autorater evaluation scripts from Cloud Build and rely exclusively on developer smoke testing.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** A core principle of AgentOps is **dataset stabilization**. A Golden Dataset serves as an immutable benchmark. Modifying test prompts to match broken candidate behavior invalidates historical trends and creates false positives. Test cases must remain frozen so prompt and model changes can be accurately compared against a stable baseline.
  * **Why Distractor B fails:** Testing unproven candidate code on 100% of production traffic exposes live users to regressions and violates safe deployment practices.
  * **Why Distractor C fails:** Re-generating test sets dynamically on every commit destroys test continuity and prevents tracking performance improvements or regressions over time.
  * **Why Distractor D fails:** Disabling automated autorater evals removes quality gates, returning to error-prone manual testing.

---

### **Question 5 (Domain 4 - Automated System Prompt Optimization)**

**Context:** A candidate news-summarization agent fails the Cloud Build quality gate because its groundedness score dropped to `3.7` (below the required `4.0` threshold). Rather than manually editing system prompts through tedious trial and error, the lead architect wants to use automated prompt engineering tools built into the framework.

**Goal:** Algorithmically optimize system prompt instructions against the golden dataset to improve groundedness scores.

**Which tool command should you run?**

* **A.** Execute **`agents-cli eval optimize`** (or `adk optimize`), leveraging the GEPA framework to algorithmically refine system instructions against the benchmark evaluation dataset.
* **B.** Run `agents-cli deploy --d agent_runtime --force` to override threshold errors.
* **C.** Set the model temperature to `2.0` in `app/agent.py`.
* **D.** Wrap the root agent in a `ParallelAgent` with `max_iterations=100`.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** ADK and `agents-cli` include automated prompt optimization via **`agents-cli eval optimize`** (powered by the GEPA / `adk optimize` framework). It evaluates failure patterns in evaluation datasets and algorithmically rewrites system instructions to maximize target evaluation metrics (like groundedness) without manual guess-and-check prompt tuning.
  * **Why Distractor B fails:** Forcing deployment overrides the quality gate and pushes an ungrounded model into production.
  * **Why Distractor C fails:** Setting temperature to `2.0` increases output randomness and hallucinations, further decreasing groundedness.
  * **Why Distractor D fails:** `ParallelAgent` runs concurrent branches, not prompt optimization; combining it with `max_iterations` (a `LoopAgent` parameter) is syntactically invalid.
