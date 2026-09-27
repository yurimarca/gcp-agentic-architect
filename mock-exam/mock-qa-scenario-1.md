Five scenario-based questions for **Scenario 1 (Low-Code Enterprise Customer Support & Data Governance)**.

---

### **Question 1 (Domain 1 & Domain 5 - Permissions-Aware Grounding)**

A global retailer is piloting a Gemini Enterprise assistant that answers employee questions from SharePoint Online and Google Drive. Employees sign in with Microsoft Entra ID. To get the pilot running quickly, the team exported both repositories to a Cloud Storage bucket and indexed the bucket as a single data store. During the pilot, a store associate asked about bonus policy and received a summary of an HR compensation document that only HR managers can open in SharePoint. The team has no developers available for custom integrations.

**What should you do?**

* **A.** Split the bucket into an HR data store and a general data store, and use a condition route on `$session.params.department` so that only users whose department is HR are routed to the HR data store.
* **B.** Replace the export with the native SharePoint and Drive connectors, authenticated with one service account that can read every site, and add a system instruction that tells the assistant not to disclose HR content to non-HR users.
* **C.** Replace the export with the native SharePoint and Drive connectors, and configure Workforce Identity Federation with Entra ID so that each user's identity is mapped and source ACLs are enforced at query time.
* **D.** Build an ADK agent that calls Microsoft Graph and the Drive API with each user's delegated OAuth token and filters results by the user's permissions before grounding the answer.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Native connectors ingest the source ACLs along with the content. Once user identities are mapped (here through Workforce Identity Federation to Entra ID), Gemini Enterprise only grounds answers in documents the signed-in user can open in the source system. This fixes the leak at the document level without custom code.
  * **Why Distractor A fails:** Department-based routing is much coarser than document-level ACLs: many HR documents are restricted to a subset of HR, and non-HR documents have their own restrictions. The session parameter is also not a trusted identity signal.
  * **Why Distractor B fails:** The connectors are right, but a single service account identity makes every document visible to the retrieval layer. A system instruction is a soft control that the model can ignore or be manipulated into ignoring.
  * **Why Distractor D fails:** It would enforce permissions correctly, but it is a custom build with ongoing maintenance, and the team has no developers available. The native connectors do the same thing out of the box.

---

### **Question 2 (Domain 5 - PII Redaction Before the Model)**

Customers of the retailer's support agent sometimes paste full credit card numbers into the chat when disputing a charge. Compliance requires that card numbers never reach the model. The support team insists that the conversation must continue normally so the agent can still help with the dispute, rather than rejecting the message. The agent is managed by a vendor, and you cannot change its code.

**What should you do?**

* **A.** Create a Model Armor input template using Sensitive Data Protection advanced configuration with a de-identification template that masks card numbers, applied inline at ingress.
* **B.** Create a Model Armor input template that uses Sensitive Data Protection basic configuration with the credit card infoType, and set the enforcement type to `Inspect and block`.
* **C.** Add a `before_model_callback` that calls the Sensitive Data Protection `deidentify` API on each user message and replaces card numbers with a placeholder before the model call.
* **D.** Export conversation logs to BigQuery and run a scheduled Sensitive Data Protection job that finds and redacts card numbers from the stored transcripts.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Model Armor's SDP advanced configuration can apply a de-identification template, which returns a sanitized prompt with the card number masked instead of rejecting the whole message. Applied inline at ingress, it keeps card numbers away from the model without any change to the agent's code, and the conversation continues.
  * **Why Distractor B fails:** Basic configuration detects the card number, and `Inspect and block` then rejects the entire prompt. The model never sees the number, but the customer's message is dropped, which breaks the requirement to keep the conversation going.
  * **Why Distractor C fails:** It would redact correctly, but callbacks are agent code, and you cannot modify the vendor's agent.
  * **Why Distractor D fails:** It redacts data after the fact. By the time the batch job runs, the card number has already been sent to the model.

---

### **Question 3 (Domain 1 - Open-Ended Q&A in Conversational Agents)**

Your Conversational Agents (Dialogflow CX) support agent handles order status and returns through deterministic flows. The business now wants it to also answer open-ended questions about store policies and warranties. The source material is about 300 PDF guides in a Cloud Storage bucket, and the policy team replaces a few dozen of them every month. The contact-center team that maintains the agent has no developers and does not want to rebuild conversation paths every time a guide changes.

**What should you do?**

* **A.** Use Gemini to generate an intent with training phrases and a static response for each policy topic in the guides, and import the intents into the agent after each monthly update.
* **B.** Create a Generator whose prompt contains the text of the policy guides, and call it from a route on the Default Start Flow whenever no other intent matches.
* **C.** Build a Cloud Run webhook that queries a Vector Search index of the guides and returns the top passages as fulfillment text, and call it from the no-match event handler.
* **D.** Create an unstructured data store from the Cloud Storage bucket, refresh it when the guides change, and attach it to the agent as a data store tool for open-ended questions.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Data store tools and handlers are the built-in way for Conversational Agents to answer open-ended questions from indexed documents. The monthly update becomes a data store refresh; no flows, intents, or code need to change.
  * **Why Distractor A fails:** Hundreds of generated intents with static answers have to be regenerated, reviewed, and re-imported every month. They are also brittle for questions phrased in ways the training phrases do not cover.
  * **Why Distractor B fails:** 300 PDFs do not fit in a generator prompt, and pasting guide text into the prompt means editing the agent each month.
  * **Why Distractor C fails:** It would work, but it requires writing and operating custom webhook code, which the team cannot maintain, and it reimplements what data store tools provide natively.

---

### **Question 4 (Domain 1 - Page Lifecycle & Form Parameters)**

In the `ProcessReturn` flow of your Dialogflow CX agent, the `Collect Order` page has a required form parameter `order_number`. Transcript review shows that customers who open the conversation with "I want to return order 48213" are still asked "What is your order number?" The `return.start` intent, which routes into this flow, has many training phrases that contain order numbers, but the numbers in those phrases are not annotated.

**What should you do?**

* **A.** Add a condition route on the `Collect Order` page with the condition `$session.params.order_number != null` that transitions directly to the next page, so the form is skipped when the number is already known.
* **B.** Annotate the order numbers in the `return.start` training phrases with a parameter whose ID and entity type match the page's `order_number` form parameter, so that the form is prefilled.
* **C.** Add an entry fulfillment webhook on the `Collect Order` page that parses the last user utterance with a regular expression and sets `order_number` in the session parameters.
* **D.** Change `order_number` from required to optional on the `Collect Order` page so that the agent stops prompting for it, and read it later from the session if it is present.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** When a page becomes active, form parameter prefilling copies matching intent or session parameters into the form before the agent prompts the user. Because the intent's training phrases are not annotated, no `order_number` parameter is ever extracted, so there is nothing to prefill. Annotating the phrases with a matching parameter fixes this with no code.
  * **Why Distractor A fails:** The route would work only if `order_number` were already set, and it never is, because nothing extracts it from the first utterance. It treats the symptom, not the cause.
  * **Why Distractor C fails:** It works, but it adds custom webhook code and a fragile regular expression to do what intent parameter extraction and form prefilling already do natively.
  * **Why Distractor D fails:** It stops the repeat question, but customers who did not include an order number are never asked for it, so the return cannot be processed.

---

### **Question 5 (Domain 1 - Grounding Confidence & Fallback)**

During pilot testing of your Conversational Agents support agent, which uses a data store of store-policy guides, testers ask about topics the guides do not cover, such as store parking or employee discounts. The agent often answers with confident-sounding guesses that are not supported by any document. The business wants the agent to answer only when the guides clearly support the answer and otherwise reply with a standard message that offers a transfer to a human. The fix must be made in the console without code.

**What should you do?**

* **A.** Add a document to the data store that lists topics the company does not provide information about, such as parking and employee discounts, so that the agent retrieves it for those questions.
* **B.** Set the generative model's temperature to 0 in the agent's generative settings so that responses are deterministic and stay close to the retrieved content.
* **C.** Raise the grounding confidence threshold in the data store settings, and configure the fallback for the data store handler to return the standard message with a live-agent handoff.
* **D.** Add a line to the agent's instructions: "Only answer if the information is in the policy guides; otherwise say you don't know and offer a human agent."

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** The grounding confidence threshold stops the agent from returning generated answers that are weakly supported by the retrieved content. The data store handler's fallback then returns the standard message and handoff. Both are console settings, so no code is needed.
  * **Why Distractor A fails:** It only covers topics someone thought to list. Customers will ask about many other unsupported topics, and the list becomes an endless maintenance task.
  * **Why Distractor B fails:** Temperature controls randomness, not grounding. A model at temperature 0 can still produce an unsupported answer consistently.
  * **Why Distractor D fails:** It may reduce guesses, but it relies on the model following an instruction, which is not deterministic. The confidence threshold enforces the behavior at the platform level.
