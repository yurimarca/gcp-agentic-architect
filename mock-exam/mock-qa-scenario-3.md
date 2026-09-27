Five scenario-based questions for **Scenario 3 (Healthcare Knowledge Graph & Multimodal GraphRAG)**.

---

### **Question 1 (Domain 3 - RAG Engine Deployment Modes & CMEK)**

A regional healthcare network is building a clinical decision-support agent on RAG Engine to index consultation notes and clinical guidelines. The security office requires that every copy of patient-derived data, including embeddings and indexes, be encrypted with keys the network manages in Cloud KMS. The two-person platform team wants a managed RAG service and does not want to operate its own vector database.

**What should you do?**

* **A.** Deploy RAG Engine in Serverless mode, and enable customer-managed encryption keys on the Cloud Storage bucket that holds the source documents.
* **B.** Deploy RAG Engine in Serverless mode, and place the project in a VPC Service Controls perimeter so that the index cannot be accessed from outside the network.
* **C.** Deploy AlloyDB with `pgvector` and customer-managed encryption keys, and write retrieval code in the agent that runs similarity queries against it.
* **D.** Deploy RAG Engine in Spanner mode with customer-managed encryption keys enabled on the dedicated Spanner instance that stores the RAG data.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Serverless mode provisions a managed Vector Search collection that does not support CMEK. Spanner mode stores RAG data on dedicated Spanner infrastructure, which supports CMEK, while RAG Engine remains a managed service.
  * **Why Distractor A fails:** Only the source documents are encrypted with the network's keys. The embeddings and index that RAG Engine creates in Serverless mode are not.
  * **Why Distractor B fails:** VPC Service Controls limits access and exfiltration, but it does not change how data is encrypted, so the CMEK requirement is still unmet.
  * **Why Distractor C fails:** It meets the CMEK requirement, but the team would be operating its own vector database and writing retrieval code, which it wants to avoid.

---

### **Question 2 (Domain 3 - GraphRAG with Spanner Graph)**

Clinicians want the agent to answer questions such as "Which patients on drug X have a condition that contraindicates drug Y, and what did similar past cases do?" Today, relationships between patients, medications and conditions are in BigQuery tables, consultation notes are embedded in Vector Search, and the agent joins the two in Python. Results are often inconsistent because the two stores are updated at different times. The team wants one operational store where multi-hop relationship queries and vector similarity run together.

**What should you do?**

* **A.** Move everything to AlloyDB, store the note embeddings with `pgvector`, and write recursive common table expressions to follow patient–drug–condition relationships across multiple hops.
* **B.** Model patients, medications and conditions as a property graph in Spanner Graph, store note embeddings in the same database, and combine graph traversals with vector distance in one query.
* **C.** Keep the relationship tables in BigQuery, generate the note embeddings there too, and use BigQuery vector search with SQL joins to answer relationship questions.
* **D.** Keep both existing stores, run the relationship query and the vector query in parallel, and merge their results with Reciprocal Rank Fusion before sending them to the model.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Spanner Graph stores property graph nodes and edges and vector embeddings in one database, so multi-hop graph pattern queries and vector similarity can be combined in a single, consistent query. This is the GraphRAG pattern the scenario needs.
  * **Why Distractor A fails:** It gives one store, but multi-hop relationships are expressed as recursive joins with no native graph query model. These become complex and slow as the number of hops grows.
  * **Why Distractor C fails:** BigQuery is an analytics warehouse. It is not built for low-latency, per-request serving to an agent, and it also lacks native graph traversal.
  * **Why Distractor D fails:** RRF merges ranked lists; it does not traverse relationships and does not fix the consistency problem caused by two separately updated stores.

---

### **Question 3 (Domain 3 - Hybrid Search & Rank Fusion)**

The clinical agent currently uses semantic vector search only. When clinicians search for an exact ICD-10 code such as `E11.9`, the top results often describe related codes like `E11.8`. An earlier keyword-only prototype had the opposite problem: it missed notes that described the same condition in different words. The team wants one retrieval pipeline that handles both kinds of query well.

**What should you do?**

* **A.** Run keyword search first, and run vector search only if the keyword search returns no results, then pass whichever result set was produced to the reranker.
* **B.** Run keyword search and vector search in parallel, normalize each result's raw score to a 0–1 range, and sort the combined list by the normalized score.
* **C.** Run keyword search and vector search in parallel, merge the two ranked lists with Reciprocal Rank Fusion, and then rerank the merged candidates with the Ranking API.
* **D.** Fine-tune the embedding model on a dataset of ICD-10 codes and their descriptions, so that vector search alone distinguishes exact codes from related ones.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Hybrid search runs both retrievers in parallel. RRF combines them by rank position, which works even though keyword scores and vector similarities are on different scales. The Ranking API then reorders the merged candidates for relevance before the model sees them.
  * **Why Distractor A fails:** A query that returns a few keyword matches never runs vector search, so semantically relevant notes are missed whenever there are partial keyword hits.
  * **Why Distractor B fails:** Keyword and vector scores are not comparable, even after normalization, so one retriever can dominate unpredictably. Rank-based fusion avoids this.
  * **Why Distractor D fails:** It is costly, and embeddings are still weak at exact-token matching, so exact code lookups would remain unreliable.

---

### **Question 4 (Domain 3 - Multimodal Ingestion)**

The network stores X-ray images in Cloud Storage alongside the text of consultation notes. Radiologists want to search in two ways: by text, for example "hairline fracture of the distal radius", and by image, by uploading a new X-ray to find visually similar past cases. Both kinds of search should return relevant images and notes together. The team does not want to run a separate computer-vision pipeline.

**What should you do?**

* **A.** Use an event-driven pipeline that sends each X-ray and each note to a multimodal embedding model, and store all the vectors together in one index.
* **B.** Use Gemini to write a detailed text description of each X-ray, embed those descriptions with a text embedding model, and index them together with the note embeddings.
* **C.** Run OCR on each X-ray to extract any printed labels and annotations, and index the extracted text together with the consultation notes in the text index.
* **D.** Embed the X-rays with an image embedding model and the notes with a text embedding model, store each in its own index, and query both indexes for every search.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** A multimodal embedding model places images and text in the same vector space. A text query can then find relevant images, an image query can find similar images and related notes, and no separate computer-vision pipeline is needed.
  * **Why Distractor B fails:** Text search would work, but image-to-image search now depends on generated descriptions, which lose the visual detail that makes two X-rays similar.
  * **Why Distractor C fails:** X-rays contain little text, so OCR discards almost all of the diagnostic information.
  * **Why Distractor D fails:** Vectors from two separate models are in different spaces and cannot be compared, so a text query cannot find images, and the reverse is also true.

---

### **Question 5 (Domain 3 - Long-Term Memory)**

Physicians want the clinical agent to remember things they have said in earlier sessions, such as "I follow the ADA guidelines" or "give me summaries as bullet points", without repeating them each time. Physicians sometimes change these preferences. For example, one cardiologist recently switched from the ACC guidelines to the ESC guidelines. The remembered information must be retrievable only for the physician it belongs to. The agent already uses a managed session service.

**What should you do?**

* **A.** Use `VertexAiRagMemoryService` to store each physician's full session transcripts, and search them for relevant past statements at the start of each new session.
* **B.** Store each preference in a `user:` state key, such as `user:guideline_source`, and add every key the agent might need to its instructions with templating.
* **C.** Load each physician's last 20 sessions from the session service into the model's context at the start of every new session.
* **D.** Use `VertexAiMemoryBankService` to extract and consolidate facts from each physician's completed sessions, and search the physician's memories when a new session starts.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Memory Bank uses an LLM to extract facts from sessions and consolidate them, so a newer preference updates or replaces an older one. Memories are scoped to the user and retrievable by similarity search.
  * **Why Distractor A fails:** Raw transcript search returns everything that was said, including outdated preferences. The cardiologist's old ACC statement can be retrieved alongside, or instead of, the new ESC one.
  * **Why Distractor B fails:** `user:` state suits a few known, structured settings. It cannot capture open-ended facts that no one anticipated, and it has no semantic search.
  * **Why Distractor C fails:** It fills the context with irrelevant history, costs more, and still misses anything said more than 20 sessions ago.
