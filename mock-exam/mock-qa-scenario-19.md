Five scenario-based questions for **Scenario 19 (Mining Exploration Assistant with RAG over a Large Corpus)**.

---

### **Question 1 (Domain 3 - Layout-Aware Chunking)**

A mining company indexes 500,000 geological survey PDFs in RAG Engine. The reports contain drill-depth tables and multi-column text. With fixed-size chunking, tables are split across chunks, and answers mix rows from different drill holes because rows are separated from their headers. The team does not want to write custom parsing code.

**What should you do?**

* **A.** Increase the chunk size to 2,000 tokens so that most tables fit inside a single chunk along with their headers.
* **B.** Increase the chunk overlap to 50 percent so that rows near a boundary appear in both of the neighboring chunks.
* **C.** Convert the PDFs to plain text before ingestion to remove layout noise, and then chunk the text by paragraph.
* **D.** Use RAG Engine's layout parser so that chunks follow sections and keep tables with their headers.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Layout-aware parsing detects headings, columns, and tables and chunks along those boundaries, so table rows stay with their headers without custom code.
  * **Why Distractor A fails:** Large tables still split, and bigger chunks dilute relevance for every other query.
  * **Why Distractor B fails:** Overlap duplicates content but does not reattach headers to rows far from them, and it inflates the index.
  * **Why Distractor C fails:** Converting to plain text destroys the table structure that is causing the problem.

---

### **Question 2 (Domain 3 - Hybrid Search)**

Geologists search with exact drill-site codes such as `AU-2024-89B` and also with concepts such as "gold mineralization in quartz veins." Many questions combine both, for example "lithology at AU-2024-89B." Vector search misses the codes, and keyword search misses synonyms for rock types.

**What should you do?**

* **A.** Move to a larger embedding model so that exact alphanumeric codes are represented more precisely in the vector space.
* **B.** Use keyword search with a synonym dictionary of rock types and minerals that the geology team maintains.
* **C.** Run keyword and vector search in parallel and merge the two result lists with Reciprocal Rank Fusion.
* **D.** Detect codes with a regular expression, send those queries to keyword search, and send all other queries to vector search.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Hybrid search gets exact matching from keyword search and semantic matching from vector search on every query. Reciprocal Rank Fusion merges the two lists without having to calibrate their scores against each other.
  * **Why Distractor A fails:** Embeddings capture meaning, not exact strings. A larger model does not reliably match specific codes.
  * **Why Distractor B fails:** A manually maintained dictionary never covers all the semantic variation and becomes a permanent maintenance task.
  * **Why Distractor D fails:** Queries that contain both a code and a concept need both kinds of search, but routing sends them to only one.

---

### **Question 3 (Domain 3 - Reranking Before Synthesis)**

Hybrid search returns 50 passages. Sending all 50 to the model raises latency and cost, and answers overlook relevant passages in the middle of the list. When the team keeps only the top 5 by fused rank, the most relevant passage is sometimes lost, because it was ranked 12th.

**What should you do?**

* **A.** Send all 50 passages to the model, sorted by fused rank, so that the strongest candidates appear first in the prompt.
* **B.** Score the 50 passages against the query with the ranking API and pass only the top 5 reranked passages to the model.
* **C.** Summarize each of the 50 passages with a smaller model and send the 50 summaries to the main model instead of the originals.
* **D.** Tune the Reciprocal Rank Fusion constant so that passages with strong keyword matches move higher in the fused list.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** A reranker scores each passage directly against the query, which is more precise than rank fusion. It can move the 12th passage into the top 5, so a small, high-quality context reaches the model.
  * **Why Distractor A fails:** Cost and latency stay the same, and the lost-in-the-middle problem remains.
  * **Why Distractor C fails:** It adds 50 model calls and loses the exact figures and details that geological answers depend on.
  * **Why Distractor D fails:** Fusion only combines rankings. Adjusting it does not add a real measure of relevance to the query.

---

### **Question 4 (Domain 4 - Measuring Groundedness)**

Users report answers that include mineral concentration figures that appear nowhere in the retrieved sources. The team's evaluation suite compares answers with reference answers using ROUGE, and it still scores well. The team needs an automated metric that catches this failure before release.

**What should you do?**

* **A.** Add a groundedness autorater that checks whether each claim in the answer is supported by the retrieved context.
* **B.** Add more reference answers to the golden dataset and raise the minimum ROUGE score required for release.
* **C.** Add tool trajectory precision and recall metrics to verify that the retrieval tool is called for each question.
* **D.** Add a response relevance metric that checks whether each answer addresses the geologist's question.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Groundedness measures whether the output is supported by the tool context, which is exactly the failure of invented figures that are not in the sources.
  * **Why Distractor B fails:** ROUGE measures word overlap. An answer can overlap heavily with a reference and still contain an invented number.
  * **Why Distractor C fails:** Trajectory metrics check which tools were called, not whether the answer stays faithful to what came back.
  * **Why Distractor D fails:** An answer can be highly relevant to the question and still contain invented figures.

---

### **Question 5 (Domain 4 - Finding Evaluation Regressions)**

The team changed the chunk size from 500 to 200 tokens and re-ran the evaluation suite. Average groundedness barely moved, from 4.3 to 4.2, but users say some kinds of questions are now answered worse. The team has `results_v1.json` from before the change and `results_v2.json` from after, and wants to see exactly which cases got worse.

**What should you do?**

* **A.** Run `agents-cli eval analyze` on `results_v2.json` to group the failing cases in the new run into clusters.
* **B.** Add more cases to the golden dataset and re-run `agents-cli eval run` to get a more stable average score.
* **C.** Inspect Cloud Trace spans for production requests made after the change to find slow or failing retrievals.
* **D.** Run `agents-cli eval compare` with `results_v1.json` as the baseline and `results_v2.json` as the candidate.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** `eval compare` compares a baseline and a candidate run side by side for each case, showing exactly where scores dropped even when the average hides it.
  * **Why Distractor A fails:** `analyze` groups failures within a single run. It does not show what changed relative to the baseline.
  * **Why Distractor B fails:** A larger average still hides regressions for each case.
  * **Why Distractor C fails:** Traces show latency and errors in execution, not answer quality compared against the evaluation baseline.
