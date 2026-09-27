Five scenario-based questions for **Scenario 6 (Automated CI/CD Evaluation Gate for Content Summarization)**.

---

### **Question 1 (Domain 4 - `agents-cli eval` Commands)**

A publishing company's pipeline deploys each candidate news-summarization agent to staging. The pipeline must then run the golden dataset against the candidate, score the results with the autorater, and show reviewers a side-by-side diff against the scores of the version currently on the main branch, which are stored as a JSON artifact.

**Which commands should the pipeline run?**

* **A.** `agents-cli eval generate` against the candidate, followed by `agents-cli eval compare` between the generated traces and the stored baseline results.
* **B.** `agents-cli eval run` against the candidate, followed by `agents-cli eval compare` between the new results and the stored baseline results.
* **C.** `agents-cli eval run` against the candidate, followed by `agents-cli eval analyze` on the new results together with the stored baseline results.
* **D.** `agents-cli eval grade` on the golden dataset, followed by `agents-cli eval compare` between the grading output and the stored baseline results.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** `eval run` chains `generate` (runs the dataset against the agent) and `grade` (scores the traces) in one step. `eval compare` then produces the side-by-side diff between the baseline and candidate results.
  * **Why Distractor A fails:** `generate` only produces traces; without `grade` there are no scores to compare.
  * **Why Distractor C fails:** `analyze` groups failures into clusters to explain what went wrong. It does not produce a baseline-versus-candidate diff.
  * **Why Distractor D fails:** `grade` scores traces that already exist. Run on its own, it has no candidate traces to score.

---

### **Question 2 (Domain 4 - Cloud Build Quality Gates)**

Your `cloudbuild.yaml` has an evaluation step that runs `agents-cli eval run`, followed by a deploy step. Last week, a candidate whose groundedness score was 3.6 was deployed, even though the team's minimum is 4.0. The evaluation step's logs show the low score, and the step finished successfully. The release must be blocked automatically when the score is too low.

**What should you do?**

* **A.** Set `allowFailure: false` on the evaluation step, so that Cloud Build stops the pipeline instead of continuing to the deploy step whenever the evaluation does not pass.
* **B.** Create a log-based metric for the groundedness score in the evaluation output, and add a Cloud Monitoring alert that notifies the release manager when the score is below 4.0.
* **C.** Move the threshold check into a separate Cloud Build trigger that runs after each deployment and rolls back to the previous release if groundedness is below 4.0.
* **D.** Add a step between evaluation and deployment that reads the groundedness score from the evaluation results and exits with a non-zero code when it is below 4.0.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** `eval run` reports scores but exits successfully, so Cloud Build has no failure to act on. A gate step that compares the score with the threshold and exits non-zero fails the build before the deploy step runs.
  * **Why Distractor A fails:** `allowFailure: false` is already the default. The step did not fail, because the evaluation command exited successfully, so this setting changes nothing.
  * **Why Distractor B fails:** An alert tells a person about the problem; it does not stop the release automatically.
  * **Why Distractor C fails:** The poor candidate still reaches production before being rolled back, so users are exposed to it.

---

### **Question 3 (Domain 4 - Trajectory Metrics)**

The summarization agent is expected to call `Search_Article_Database`, then `Extract_Full_Text`, then `Generate_Summary`. After a prompt change, some summaries became shallow. Traces show that the agent sometimes skips `Extract_Full_Text` and summarizes the search snippet. The CI groundedness gate still passed, because those summaries are faithful to the snippet the agent retrieved.

**What should you add to the evaluation?**

* **A.** Expected tool sequences in the golden dataset, scored with an in-order trajectory match and tool recall metric, with a threshold in the CI gate.
* **B.** A tool precision metric in the CI gate, which measures how many of the agent's tool calls were needed to produce the expected summary.
* **C.** A higher groundedness threshold in the CI gate, so that summaries that are only partly supported by the retrieved context fail more often.
* **D.** A ROUGE-L comparison between each generated summary and a human-written reference summary, with a minimum overlap threshold in the CI gate.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The failure is in the agent's trajectory, not in the faithfulness of its output. In-order matching catches steps that are missing or out of order, and recall catches required tools that were never called.
  * **Why Distractor B fails:** Precision penalizes unnecessary calls. A skipped call is a missing call, which precision does not detect.
  * **Why Distractor C fails:** The summaries are grounded in the snippet, which is valid tool context, so a higher threshold still passes them.
  * **Why Distractor D fails:** Text overlap may drop slightly, but it measures surface similarity. It does not identify the skipped step reliably and is sensitive to harmless wording changes.

---

### **Question 4 (Domain 4 - Golden Dataset Stability)**

Over two months, the agent's CI pass rate rose from 72% to 95%, while production complaints about summary quality also rose. The git history shows that the golden dataset file was edited in the same pull requests as prompt changes, often by rewording test prompts that had been failing.

**What should you do?**

* **A.** Replace the golden dataset with 200 production conversations sampled at random on each CI run, so that evaluation always reflects what real users currently ask.
* **B.** Switch the autorater to a more capable judge model, so that scores are stricter and harder to pass with superficial changes to the agent's prompts.
* **C.** Freeze the golden dataset, version it separately from the agent code with its own review, and compare each candidate against a stored baseline.
* **D.** Generate new synthetic test cases from the current prompt on every commit, so that the dataset keeps pace with changes to the agent's behavior.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Scores are only comparable over time if the test cases stay the same. Editing tests to match the candidate's behavior inflates pass rates and hides regressions. A frozen, separately reviewed dataset restores a stable baseline.
  * **Why Distractor A fails:** Random samples change on every run and have no expected references, so results cannot be compared between runs.
  * **Why Distractor B fails:** A stricter judge does not fix the real problem, which is that the tests themselves keep being changed to pass.
  * **Why Distractor D fails:** Tests generated from the current prompt reflect what the candidate already does, which is the same kind of drift that caused the problem.

---

### **Question 5 (Domain 4 - Improving Failing Prompts Systematically)**

A candidate failed the CI gate with a groundedness score of 3.7 against a threshold of 4.0. Reviewers see that the agent often adds background facts from the model's own knowledge. Two engineers spent a week editing the system instruction by hand with little progress. The lead wants a systematic, repeatable approach that does not weaken the release standard.

**What should you do?**

* **A.** Run `agents-cli eval optimize` with the golden dataset's reference answers added to the system instruction as few-shot examples, so that the agent learns the expected answers directly.
* **B.** Run `agents-cli eval analyze` to cluster the failures, then run `agents-cli eval optimize` to refine the system instruction against the golden dataset, and re-run the CI gate.
* **C.** Lower the groundedness threshold to 3.5 for this release, and add a backlog item to raise it back to 4.0 once the prompt has been improved by hand.
* **D.** Switch the agent to the most capable model available, re-run the evaluation, and keep the larger model if the groundedness score then meets the threshold.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** `analyze` identifies the failure patterns, and `optimize` (built on GEPA) refines the instruction iteratively against the evaluation metrics. The result is then validated by the same, unchanged gate.
  * **Why Distractor A fails:** Putting the test set's expected answers into the prompt leaks the answers to the test. Scores rise without real improvement, and the model is over-fitted to the benchmark.
  * **Why Distractor C fails:** It weakens the release standard, which the lead explicitly wants to avoid.
  * **Why Distractor D fails:** It might pass, but it is trial and error rather than a systematic method, it raises cost, and it does not address why the agent adds ungrounded facts.
