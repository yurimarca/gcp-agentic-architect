Five scenario-based questions for **Scenario 12 (Aviation Maintenance Assistant on Conversational Agents)**.

---

### **Question 1 (Domain 1 - Modular Flows for Multiple Teams)**

An airline's hangar assistant is built in Conversational Agents (Dialogflow CX). Three teams (engine maintenance, avionics, and cabin safety) each own part of the conversation. Today all 60 pages live in the Default Start Flow, and changes made by one team regularly break transition routes that another team depends on. Maintenance procedures must follow a deterministic, auditable sequence, and technicians should keep using a single assistant.

**What should you do?**

* **A.** Keep the pages in the Default Start Flow, give each team a page-name prefix, and require a review from every team before any route change is published.
* **B.** Build three separate agents, one per team, and give technicians a separate chat entry point for engine, avionics, and cabin questions.
* **C.** Replace each team's pages with a generative playbook and let the model decide which team's playbook should handle each technician request.
* **D.** Split the agent into one flow per team, route into each flow from the Default Start Flow, and have each team own the pages and routes inside its flow.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Flows are the unit of modularity in Conversational Agents. Each team can build and test its own flow without touching the others, the Default Start Flow routes into them, and technicians still see one agent.
  * **Why Distractor A fails:** Naming conventions and review gates do not change the architecture. All pages still share one state graph, so collisions continue and every change slows down.
  * **Why Distractor B fails:** Separate agents give up the single entry point. Technicians would need to know which agent to ask, and questions that cross topics would have no home.
  * **Why Distractor C fails:** Playbooks trade deterministic control for generative behavior. The requirement for an auditable, fixed sequence of maintenance steps calls for flows and pages.

---

### **Question 2 (Domain 1 - Intent Routes vs. Condition Routes)**

On the `InspectCompressor` page, a webhook writes the recorded damage score into `$session.params.damage_score`. If the score is above 7, the agent must move to `ReplaceBlade`. If the technician says the compressor looks clean, it must move to `RoutineSignoff`. The team configured both transitions as intent routes, using training phrases such as "damage is high", and the move to `ReplaceBlade` rarely fires, because technicians never say those words.

**What should you do?**

* **A.** Use a condition route on `$session.params.damage_score > 7` for replacement, and an intent route for the clean statement.
* **B.** Keep both intent routes and add many more training phrases that describe high damage, so the intent matches a wider range of wording.
* **C.** Move both decisions into the webhook, and have it return the target page on every turn based on the score and the technician's raw text.
* **D.** Add a `sys.no-match` event handler that checks the damage score and transitions to `ReplaceBlade` when the score is above 7.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** The two triggers are different in kind. The score is data in session parameters, which a condition route evaluates directly. "Looks clean" is something the technician says, which is what intent routes match.
  * **Why Distractor B fails:** The score is not in the technician's words, so no set of training phrases can reliably detect it.
  * **Why Distractor C fails:** This moves routing into custom code and adds a webhook call to every turn, when condition routes handle the check natively.
  * **Why Distractor D fails:** No-match fires only when the input fails to match anything. The damage check must run whenever the score is set, not only after unrecognized input.

---

### **Question 3 (Domain 1 - Handling Unexpected Events)**

Technicians use the assistant by voice in noisy hangars. Three problems keep ending conversations. Technicians go silent for a long time while inspecting a part. Engine noise garbles their speech. The inventory webhook sometimes times out, and the technician then hears a generic system error. The team wants the agent to recover gracefully from all three without writing code.

**What should you do?**

* **A.** Increase the inventory webhook timeout to the maximum allowed and add a generative fallback prompt that asks the technician to try again.
* **B.** Enable generative fallback on the agent so that the model produces a helpful response whenever the technician's input does not match an intent.
* **C.** Add event handlers for no-input, no-match, and webhook errors on the relevant pages and flows, each with a reprompt or a fallback transition.
* **D.** Create a route group with intents for "repeat that" and "the system is down" and attach it to every page in the maintenance flows.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** Silence, unrecognized input, and webhook failures each raise a built-in event. Event handlers on pages and flows let the agent reprompt, retry, or move to a fallback page without any code.
  * **Why Distractor A fails:** A longer timeout only reduces one of the three problems and does nothing for silence or garbled speech.
  * **Why Distractor B fails:** Generative fallback helps only with no-match. It does not cover silence or a failed webhook.
  * **Why Distractor D fails:** Intents depend on the technician saying something recognizable. Silence and webhook errors produce no utterance to match.

---

### **Question 4 (Domain 1 - Multimodal Ingestion)**

The airline wants the assistant to answer questions from 30 years of scanned maintenance logs with handwritten annotations, photos of engine wear, and PDF manuals full of wiring diagrams. A vendor pipeline currently runs OCR on everything and indexes plain text. Answers that depend on a diagram or a photo are wrong or missing. The team wants to stop maintaining a custom pre-processing pipeline.

**What should you do?**

* **A.** Keep the OCR pipeline, raise its scan resolution, and have engineers write a text caption for each photo and diagram before it is indexed.
* **B.** Ingest the original files into an Agent Search data store with multimodal parsing, so text, tables, and images are understood as they are.
* **C.** Replace the vendor pipeline with a Cloud Function that converts each page to text and indexes it in a structured data store keyed by tail number.
* **D.** Store the photos and diagrams in Cloud Storage and index only their file names and folder paths as metadata alongside the OCR text.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** Gemini-based multimodal ingestion reads text, tables, and visual content directly. The information in diagrams and photos stays searchable, and the custom OCR pipeline goes away.
  * **Why Distractor A fails:** Manual captioning does not scale to 30 years of content and still loses most of the visual detail.
  * **Why Distractor C fails:** It is still a custom text-conversion pipeline, and converting to text throws away the visual content that caused the problem.
  * **Why Distractor D fails:** File names do not describe what an image shows, so questions about wear patterns or wiring still cannot be answered.

---

### **Question 5 (Domain 1 - Extracting Structured Parameters)**

Technicians say things like "check inventory for part A320-884-X installed October 12th." The inventory webhook needs `part_number` and `install_date`. Today the webhook receives the raw text and parses it with custom string-handling code that breaks on new phrasings. Technicians sometimes leave out the date. The team wants to remove the parsing code.

**What should you do?**

* **A.** Add required form parameters to the page, using a regexp entity for the part number and the system date entity for the date.
* **B.** Add a generator that asks the model to extract the part number and date as JSON from each utterance, and pass its output to the inventory webhook.
* **C.** Create an intent with training phrases annotated for both parameters, and call the webhook directly from the intent route without a form on the page.
* **D.** Send the raw utterance to a data store tool over the inventory export, and let retrieval find the matching part and installation record.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Form parameters with entity types extract structured values from natural language, and the page's required-parameter prompts ask for anything missing before the webhook is called. No parsing code is needed.
  * **Why Distractor B fails:** Generative extraction is not deterministic, and it has no built-in way to reprompt for a missing date. The webhook would still need to validate the output.
  * **Why Distractor C fails:** Intent parameters are extracted, but without a form nothing prompts the technician when the date is missing, so the webhook gets incomplete input.
  * **Why Distractor D fails:** An inventory lookup is a transactional query against the system of record. Retrieval over an export is neither exact nor current.
