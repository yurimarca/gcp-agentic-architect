Five scenario-based questions for **Scenario 9 (Strict Principal Access Boundary - PAB Enforcement)**.

---

### **Question 1 (Domain 5 - Limiting an Agent's Blast Radius)**

An investment bank's financial analysis agent runs under its own identity and reads ledgers in `project-finance-prod`. The organization has hundreds of projects, and other teams regularly grant roles to service accounts. The CISO wants a guarantee that, even if the agent is manipulated through prompt injection, or someone accidentally grants it a role elsewhere, it can never access resources outside `project-finance-prod`. The solution must not require changing policies on other teams' resources.

**What should you do?**

* **A.** Create IAM deny policies on the HR and Legal projects that deny all permissions to the agent's principal, and add the same deny policy to new sensitive projects as they are created.
* **B.** Create a Principal Access Boundary policy whose only eligible resources are in `project-finance-prod`, and bind it to a principal set that contains the agent's identity.
* **C.** Remove every role granted to the agent outside `project-finance-prod`, and set up Cloud Asset Inventory feeds that alert the security team whenever a new role is granted to the agent elsewhere.
* **D.** Set the organization policy constraint that restricts allowed policy member domains, so that only principals from the bank's own domain can be granted roles on any resource.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** A PAB policy is attached to principals, not to resources. It defines the complete set of resources the agent is eligible to access, so a role granted anywhere else has no effect. Evaluation fails closed.
  * **Why Distractor A fails:** Deny policies must be attached to each resource you want to protect, which means changing other teams' projects. Any project nobody thought to include remains exposed.
  * **Why Distractor C fails:** It detects new grants after they are made, so the agent can use a new grant before anyone reacts.
  * **Why Distractor D fails:** The agent's identity belongs to the bank, so the constraint does not stop it from being granted roles in any project.

---

### **Question 2 (Domain 5 - PAB Evaluation)**

The agent's identity has two Principal Access Boundary policies bound to it: one covers `project-finance`, and the other covers `project-analytics`. The agent has also been granted `roles/storage.objectViewer` on one bucket in each of `project-finance`, `project-analytics` and `project-marketing`.

**Which buckets can the agent read?**

* **A.** None of the three buckets, because the two policies do not have any eligible resources in common, and their intersection is empty.
* **B.** Only the bucket in `project-finance`, because the first PAB policy bound to a principal takes precedence and the second policy is ignored.
* **C.** All three buckets, because the agent holds an allow grant on each one, and allow grants take precedence over Principal Access Boundary policies.
* **D.** Only the buckets in `project-finance` and `project-analytics`, because the eligible resources are the union of both policies.

---

#### **Answer & Explanation**
* **Correct Answer: D**
  * **Why it's correct:** PAB policies are additive: the eligible set is the union of all policies bound to the principal. Access also needs an allow grant, so the agent can read the Finance and Analytics buckets. The Marketing bucket is outside the boundary, so its grant has no effect.
  * **Why Distractor A fails:** PAB policies combine by union, not intersection.
  * **Why Distractor B fails:** There is no precedence order; every bound policy contributes to the eligible set.
  * **Why Distractor C fails:** It is the other way around. An allow grant can be used only on resources inside the boundary.

---

### **Question 3 (Domain 5 - Conditional PAB Bindings)**

The security team wants a Principal Access Boundary policy to apply to every service account and agent identity in the `analytics` folder. The same folder also contains human administrators, who must not be restricted by the policy. The organization does not want to restructure its folders. The policy is bound to the folder's principal set.

**What should you do?**

* **A.** Add a condition to the policy binding that applies it only when `principal.type` is `iam.googleapis.com/ServiceAccount` or an agent identity type.
* **B.** Add a condition to the policy binding that checks `resource.type`, so that the boundary applies only to requests for resource types that agents use.
* **C.** Move the human administrators into a separate folder that has no PAB policy, and keep the PAB policy bound to the `analytics` folder's principal set.
* **D.** Bind the PAB policy to a Google group that contains the agents' service accounts instead of the folder's principal set, and add new agents to the group.

---

#### **Answer & Explanation**
* **Correct Answer: A**
  * **Why it's correct:** PAB policy bindings support conditions on principal attributes. A `principal.type` condition applies the boundary only to service accounts and agent identities in the folder, and human users are excluded.
  * **Why Distractor B fails:** `resource.type` describes what is being accessed, not who is accessing it, so it cannot tell agents and administrators apart.
  * **Why Distractor C fails:** It works, but it requires the restructuring the organization explicitly ruled out.
  * **Why Distractor D fails:** PAB policies are bound to principal sets such as organizations, folders, projects and identity pools, not to arbitrary groups. Group membership would also have to be managed by hand.

---

### **Question 4 (Domain 5 - PAB and Allow Policies Together)**

A developer created a service account for a new analysis agent and bound a Principal Access Boundary policy whose eligible resources are `projects/finance-analytics`. No other IAM changes were made. Every Cloud Storage request the agent makes to buckets in `finance-analytics` returns `403 Forbidden`. The developer believes that the PAB policy grants read access to that project.

**What should you do?**

* **A.** Wait several hours for the new PAB policy to propagate across Google Cloud, and then retry the requests before changing anything else.
* **B.** Edit the PAB policy to list each bucket in `finance-analytics` as an individual eligible resource, because PAB rules must name resources explicitly.
* **C.** Grant the service account an allow role, such as `roles/storage.objectViewer`, on the buckets or the project, because PAB policies do not grant any access.
* **D.** Widen the PAB policy to include the whole organization for now, so the agent can work, and narrow it again once the cause of the 403 errors is known.

---

#### **Answer & Explanation**
* **Correct Answer: C**
  * **Why it's correct:** PAB policies only limit which resources a principal is eligible to access; they never grant access. The agent needs an allow grant on resources that are also inside its boundary.
  * **Why Distractor A fails:** Nothing is waiting to propagate. Without any allow grant, the requests will keep being denied.
  * **Why Distractor B fails:** A project in the boundary covers the resources in it, so listing buckets individually is unnecessary and does not grant access.
  * **Why Distractor D fails:** A wider boundary still grants nothing, so the 403 errors continue, and the agent's blast radius is widened for no benefit.

---

### **Question 5 (Domain 5 - Token Replay Protection)**

The bank's agent runs on Agent Runtime and calls an external market-data API through Agent Gateway. In a penetration test, testers copied an access token from a verbose debug log and replayed it from a laptop to obtain market data. The CISO wants a stolen token to be useless outside the agent's runtime.

**What should you do?**

* **A.** Shorten the lifetime of the access tokens issued to the agent to five minutes, so that any token copied from logs expires before an attacker can use it.
* **B.** Use the agent's Agent Identity through Agent Gateway so that its tokens are bound with DPoP and mTLS to a key held only by the agent's runtime.
* **C.** Store the market-data API's client secret in Secret Manager, and have the agent fetch it at runtime instead of reading it from an environment variable.
* **D.** Place the agent's project in a VPC Service Controls perimeter, so that access tokens issued inside the perimeter cannot be used from outside it.

---

#### **Answer & Explanation**
* **Correct Answer: B**
  * **Why it's correct:** With DPoP and mTLS binding, each request must prove possession of a private key held only by the agent's runtime. A copied token without that key is rejected.
  * **Why Distractor A fails:** It shrinks the window for replay but does not close it; a token can still be replayed within five minutes.
  * **Why Distractor C fails:** It protects the stored secret, but the token issued from it can still be copied and replayed.
  * **Why Distractor D fails:** VPC Service Controls protects Google Cloud APIs. It has no control over how an external market-data API accepts tokens.
