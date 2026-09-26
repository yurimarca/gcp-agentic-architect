Here are **5 realistic, scenario-based multiple-choice exam questions** built directly on **Scenario 3 (Healthcare Knowledge Graph & Multimodal GraphRAG)**.

---

### **Question 1 (Domain 3 - RAG Engine Deployment Modes & CMEK Compliance)**

**Context:** A regional healthcare network is building a clinical decision-support agent using Gemini Enterprise RAG Engine to index unstructured patient notes and medical reference guides. 

**Goal:** Select the RAG Engine deployment mode for vector indexing, metadata storage, and similarity retrieval.

**Constraints:**
* Must comply with strict healthcare data security standards mandating **Customer-Managed Encryption Keys (CMEK)** for all stored embeddings and vector indices.
* Must provide dedicated database infrastructure isolation.

**Which deployment mode should you recommend?**

* **A.** Deploy RAG Engine in **Spanner Mode**, leveraging dedicated Google Cloud Spanner infrastructure for vector and metadata storage with CMEK enabled.
* **B.** Deploy RAG Engine in **Serverless Mode**, relying on automatically managed default Vector Search 2.0 collections.
* **C.** Store embeddings in Cloud Firestore and set `CMEK_DISABLED=false` in the Dialogflow CX console settings.
* **D.** Export vector embeddings as static JSON files in a Cloud Storage bucket and configure Model Armor to handle key rotation.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** RAG Engine on Gemini Enterprise Agent Platform supports two deployment modes: Serverless Mode and Spanner Mode. While Serverless Mode provides auto-provisioned Vector Search 2.0 collections, it **does not support Customer-Managed Encryption Keys (CMEK)**. Enterprise healthcare workloads requiring CMEK compliance or dedicated database isolation must deploy RAG Engine in **Spanner Mode**.
  * **Why Distractor B fails:** Serverless Mode uses default shared collections that do not support CMEK key management.
  * **Why Distractor C fails:** Cloud Firestore is not the native underlying vector index engine for RAG Engine, and Dialogflow CX settings do not control CMEK key policies for RAG Engine.
  * **Why Distractor D fails:** Static JSON files in Cloud Storage do not provide vector similarity search capabilities, and Model Armor is a content sanitization/guardrail proxy, not a key rotation engine.

---

### **Question 2 (Domain 3 - GraphRAG Architecture with Spanner Graph)**

**Context:** A clinical support team needs an agent that can traverse complex relationships between patient diagnoses, prescribed medications, contraindications, and historical treatment outcomes, while also retrieving unstructured consultation notes.

**Goal:** Architect a retrieval subsystem that combines graph relationship traversals with vector similarity search.

**Constraints:**
* Must use a single, unified Google Cloud database engine to store both property graph nodes/edges and vector embeddings.
* Must support executing multi-hop graph pattern queries and vector distance calculations in a unified query model.

**Which database solution should you implement?**

* **A.** Deploy **Spanner Graph**, modeling clinical entities and relationships as property graph tables while storing vector embeddings directly within Spanner Graph for unified graph-vector retrieval.
* **B.** Store graph edges in BigQuery and vector embeddings in Memorystore for Redis, linking them via a Cloud Function webhook.
* **C.** Configure a Dialogflow CX Custom Entity for every medical term and route queries through Google Search.
* **D.** Use Cloud SQL for PostgreSQL with `pgvector` only, and write system prompts asking the LLM to infer multi-hop relationships from raw text.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** **Spanner Graph** combines graph database capabilities with vector search in a single distributed database engine. It allows developers to model entities (patients, drugs, conditions) as property graph nodes and edges while storing vector embeddings directly alongside graph attributes, enabling GraphRAG multi-hop relationship traversals and semantic vector searches in a single query.
  * **Why Distractor B fails:** Splitting data across BigQuery and Redis increases network latency, operational overhead, and transaction complexity compared to a unified GraphRAG database engine.
  * **Why Distractor C fails:** Dialogflow CX custom entities are designed for intent parameter extraction in conversational flows, not for building scalable enterprise knowledge graphs.
  * **Why Distractor D fails:** Standard relational tables with `pgvector` lack native property graph query semantics for efficient multi-hop relationship traversals (e.g., path finding across patient-drug-symptom links).

---

### **Question 3 (Domain 3 - Hybrid Search & Reciprocal Rank Fusion)**

**Context:** A healthcare agent receives clinical queries containing exact medical codes (e.g., ICD-10 code `E11.9`) mixed with broad natural language descriptions (e.g., *"type 2 diabetes without complications"*).

**Goal:** Implement a search pipeline that delivers high precision for both exact medical codes and broad semantic concepts.

**Constraints:**
* Must execute exact keyword search and semantic vector search **in parallel**.
* Must combine and re-rank the two distinct result sets using a standardized algorithm before sending context to the LLM.

**Which retrieval pattern should you implement?**

* **A.** Execute keyword search and semantic vector search concurrently, and merge the resulting rank lists using **Reciprocal Rank Fusion (RRF)** before applying final reranking with the Agent Search Ranking API.
* **B.** Run keyword search first; if zero results are returned, execute a vector search as a sequential fallback.
* **C.** Pass all incoming queries through Model Armor to strip exact ICD-10 codes before executing pure vector search.
* **D.** Increase the LLM temperature setting to `1.5` so the model infers missing medical codes automatically.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** In enterprise GraphRAG/RAG architectures, **Hybrid Search** executes keyword search (for exact terms/codes) and semantic vector search (for broad conceptual context) in parallel. The two candidate lists are merged using **Reciprocal Rank Fusion (RRF)**, ensuring both exact matches and semantic matches are appropriately scored before undergoing final reranking with the Agent Search Ranking API.
  * **Why Distractor B fails:** Sequential fallback fails when keyword search returns a partial match; it misses complementary semantic context that would have been retrieved by running vector search concurrently.
  * **Why Distractor C fails:** Stripping exact medical codes destroys high-precision search signals critical for clinical decision making.
  * **Why Distractor D fails:** Increasing LLM temperature increases output randomness and hallucinations, which is dangerous in healthcare settings.

---

### **Question 4 (Domain 3 - Multimodal Ingestion Pipeline for Diagnostic Data)**

**Context:** The healthcare network needs to ingest unstructured diagnostic assets—specifically X-ray image files stored in Cloud Storage—into the clinical decision-support retrieval pipeline.

**Goal:** Process X-ray images and make them searchable alongside textual medical consultation notes.

**Constraints:**
* Must avoid building separate, complex OCR or third-party computer vision pre-processing pipelines.
* Must generate multimodal embeddings that map both visual features and textual notes into a shared vector space.

**Which ingestion workflow should you implement?**

* **A.** Trigger an event-driven Cloud Run pipeline (via Pub/Sub) that sends X-ray images to **Gemini Multimodal Embedding APIs** to generate unified vector embeddings, storing them directly in the vector database alongside document text embeddings.
* **B.** Run an open-source OCR script to extract raw text coordinates from images, discarding the visual image data prior to indexing.
* **C.** Convert X-ray image files into base64 strings and store them inside a Dialogflow CX Custom Entity table.
* **D.** Configure Agent Gateway in egress mode to transform binary X-ray files into plain text Markdown tables.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Gemini Multimodal Embedding models natively process both images and text into a unified embedding space. An event-driven ingestion pipeline (Cloud Storage → Pub/Sub → Cloud Run) can pass raw diagnostic images directly to the embedding API, creating vector representations that capture visual medical features without requiring separate OCR or external computer vision pipelines.
  * **Why Distractor B fails:** OCR only extracts text characters (if present) and completely discards visual features (such as bone fractures or tissue density visible in X-rays).
  * **Why Distractor C fails:** Base64 strings in Dialogflow CX custom entities do not generate vector embeddings and will fail entity size limitations.
  * **Why Distractor D fails:** Agent Gateway is a network security policy proxy for traffic management; it is not a data transformation or embedding engine.

---

### **Question 5 (Domain 3 - Privacy & Turn-Scoped State Isolation)**

**Context:** When physicians interact with the clinical decision-support agent, the agent performs intermediate risk-score calculations during a turn. System architects must ensure these intermediate variables do not leak across sessions or pollute permanent memory stores.

**Goal:** Select the appropriate Agent Development Kit (ADK) state namespace to store temporary calculations during an active invocation.

**Constraints:**
* Data stored in this namespace must be **discarded immediately** when the turn completes.
* Must prevent temporary intermediate variables from persisting into session history or user-scoped state.

**Which ADK state namespace should you use?**

* **A.** Store intermediate calculations in the **`temp:`** state namespace (e.g., `session.state["temp:risk_score"]`).
* **B.** Store intermediate calculations in the **`user:`** state namespace.
* **C.** Store intermediate calculations in the **`app:`** state namespace.
* **D.** Store intermediate calculations in the non-prefixed session state (e.g., `session.state["risk_score"]`).

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** ADK enforces strict state namespaces:
    * **`temp:`**: Scoped strictly to a **single turn/invocation** and discarded immediately after the turn ends. Ideal for scratchpad math, raw API payloads, or intermediate variables.
    * **No prefix**: Session-scoped (persists across turns in that single thread).
    * **`user:`**: User-scoped (persists across *all* sessions for that user ID).
    * **`app:`**: Global application-scoped (shared across all users and sessions).
  * **Why Distractor B fails:** The `user:` namespace persists across all future sessions for that physician/patient, leaking turn-specific scratchpad data into long-term user memory.
  * **Why Distractor C fails:** The `app:` namespace is global across the entire application, causing multi-tenant data cross-contamination.
  * **Why Distractor D fails:** Non-prefixed state is session-scoped and persists throughout the active session rather than being cleared at the end of the turn.
