Five scenario-based questions for **Scenario 11 (Renewable Energy Field Technician Assistant)**.

---

### **Question 1 (Domain 1 - Structuring System Instructions)**

A renewable energy company built a technician assistant in Agent Designer. Its system instructions are a single paragraph that says the agent "helps wind and solar technicians." In testing, the assistant answers questions about energy stock prices, formats diagnostic steps differently every time, and sometimes gives high-voltage repair guidance without first telling the technician which certification the task requires. The operations team has no developers and must fix this in the console.

**What should you do?**

* **A.** Rewrite the instructions into sections for identity, scope and refusals, diagnostic method, and output format, including the certification check.
* **B.** Add few-shot examples that pair off-topic questions with polite refusals, and keep the existing one-paragraph instruction for everything else.
* **C.** Connect a data store that contains only turbine and inverter manuals, so the assistant can only answer from maintenance content.
* **D.** Create a Model Armor input template with responsible AI filters set to `LOW_AND_ABOVE` to block questions outside the maintenance domain.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** All three problems come from underspecified instructions. Clear sections for persona, boundaries, method and output format give the model explicit rules for scope, structure and the certification check, and all of it is configured in the console.
  * **Why Distractor B fails:** Examples only cover the off-topic cases someone thought to write down. They do nothing about inconsistent formatting or the missing certification check.
  * **Why Distractor C fails:** Grounding adds sources but does not define scope, format or safety behavior. The model can still answer from general knowledge unless the instructions say not to.
  * **Why Distractor D fails:** Responsible AI filters detect harmful content categories such as hate speech or dangerous content. They do not recognize a question as off-topic for the business.

---

### **Question 2 (Domain 1 - Enforcing Output Format with Examples)**

The assistant extracts alert codes from raw turbine logs and returns them for the maintenance ticketing system. The system instructions already say "respond only in JSON with the fields `code`, `severity` and `turbine_id`." About 15% of responses still fail to parse: some are wrapped in an explanatory sentence, some use `severity_level` instead of `severity`, and severity values vary between `High`, `HIGH` and `3`. The fix must be made in the prompt, with no parsing code.

**What should you do?**

* **A.** Set the temperature to 0 in the generation settings so the model returns the same structure for every log it processes.
* **B.** Tell the model to reason through each field step by step before writing the JSON, so it checks every field name against the specification.
* **C.** Repeat the required field names in capital letters at both the start and the end of the system instructions to increase their emphasis.
* **D.** Add three examples to the instructions, each pairing a raw log excerpt with the exact expected JSON, including one log with no severity value.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** Few-shot examples show the model the exact output: field names, the allowed severity values, no surrounding prose, and how to handle a missing value. For format consistency, demonstrating the output works better than describing it.
  * **Why Distractor A fails:** A lower temperature reduces randomness, but it does not teach the model the schema or the allowed severity values. The model can produce the same wrong format consistently.
  * **Why Distractor B fails:** Step-by-step reasoning adds reasoning text to the response, which makes the "wrapped in prose" problem worse and does not define the allowed values.
  * **Why Distractor C fails:** Emphasis is still only a description. It does not settle the value format, such as `High` versus `3`, and it tends to have less effect than concrete examples.

---

### **Question 3 (Domain 1 - Multi-Step Reasoning)**

Technicians ask the assistant to troubleshoot inverter voltage anomalies. A correct diagnosis requires checking ambient temperature, then phase variance, then confirming electrical isolation before any hands-on step. Conversation logs show that the safety section of the manual is retrieved every time, but the assistant often jumps straight to a recommendation and skips the isolation check. The team must keep the current model because of its latency budget, and it cannot write code.

**What should you do?**

* **A.** Split the troubleshooting manual into smaller documents in the data store so that the isolation procedure ranks higher in retrieval results.
* **B.** Instruct the model to work through temperature, phase variance and isolation status in that order, stating each result before it gives a recommendation.
* **C.** Add few-shot examples that show the correct final recommendation for the three most common inverter faults the technicians report.
* **D.** Add a condition route that checks whether the response mentions isolation and sends the user to a static safety page when it does not.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** This is chain-of-thought prompting. Requiring the model to go through each check in order before concluding stops it from skipping intermediate steps, and it is a prompt change that works on the current model.
  * **Why Distractor A fails:** The logs show retrieval already returns the safety content. The failure is in reasoning, not retrieval.
  * **Why Distractor C fails:** Examples that show only final answers teach the model to jump to conclusions, and they do not generalize to faults outside the three examples.
  * **Why Distractor D fails:** Condition routes evaluate session parameters and other state, not the text of the generated answer. Even if they could, a keyword check would catch the missing step only after a bad answer was produced.

---

### **Question 4 (Domain 1 - Dynamic Parameter Templating)**

When a technician signs in, the assistant's start page receives their substation ID and certification tier and stores them as the session parameters `substation_id` and `technician_tier`. Even so, the generative responses still ask technicians which substation they work at and give tier-restricted procedures to technicians who are not certified for them. The team wants every response personalized for the technician, with no webhook code.

**What should you do?**

* **A.** Reference both session parameters in the instructions with parameter placeholders, so their values are filled into the prompt at runtime.
* **B.** Create a separate agent version for each substation with its ID written into the instructions, and route technicians to their version when they sign in.
* **C.** Add an instruction telling the model to use the substation and certification tier that the technician mentioned earlier in the conversation.
* **D.** Store a profile document for each technician in the data store, and let the data store tool retrieve the substation and tier when needed.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** Session parameters are not visible to the model unless they are templated into the prompt. Parameter placeholders are replaced with the current session values at runtime, so each response is personalized without code.
  * **Why Distractor B fails:** One agent version per substation is a maintenance burden, and it still does nothing with the certification tier.
  * **Why Distractor C fails:** The values were set by the sign-in flow, not said by the technician, so they are not in the conversation for the model to find.
  * **Why Distractor D fails:** Retrieval is probabilistic and can return the wrong profile or none. Values that are already in the session should be passed directly instead of searched for.

---

### **Question 5 (Domain 1 - Choosing a Low-Code Platform)**

The company also wants a public website chat for residential solar customers. It will answer questions about warranties and net-metering policies from about 400 PDF guides, and look up a customer's latest bill through an existing billing REST API that has an OpenAPI specification. The team consists of two conversation designers with no Python experience, and the chat must launch in six weeks.

**Which approach should you recommend?**

* **A.** Build an ADK agent with an Agent Search tool and an OpenAPI tool, deploy it to Agent Runtime, and embed it in the website with a lightweight custom frontend.
* **B.** Index the PDFs with Gemini Enterprise's native connectors and give customers access to the Gemini Enterprise app so they can ask questions and look up their bills.
* **C.** Build a CX Agent Studio agent with a data store tool over the PDFs and an OpenAPI tool for billing, and embed it with the prebuilt web chat widget.
* **D.** Add an Agent Search website search widget over the PDFs, and publish a separate billing FAQ page that explains how customers can find their latest bill.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** CX Agent Studio is the low-code option for customer-facing conversational agents. Data store tools cover open-ended questions over the PDFs, an OpenAPI tool calls the billing API without custom code, and the prebuilt web widget handles embedding.
  * **Why Distractor A fails:** The architecture would work, but ADK is code-first, and the team has no Python experience and a six-week deadline.
  * **Why Distractor B fails:** Gemini Enterprise is a workforce product for employees, not a public chat for customers, and it does not provide a customer billing lookup.
  * **Why Distractor D fails:** A search widget returns results, not a conversation, and a static FAQ page does not meet the requirement to look up each customer's actual bill.
