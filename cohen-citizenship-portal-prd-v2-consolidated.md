# Cohen Citizenship Portal — Product Requirements Document

**Version:** 2.0 (Consolidated)
**Date:** March 13, 2026
**Author:** Chief Product Officer
**Status:** Ready for Engineering Handoff

---

## Table of Contents

1. Executive Summary
2. Product Vision & Principles
3. User Personas
4. Journey Overview
5. Screen-by-Screen Specifications
6. Case Manager Dashboard
7. Data Model
8. Intake Logic Engine
9. Document Intelligence Layer
10. Form Auto-Fill Engine (CIT-0001 & IMM 5476)
11. Chain of Descent: State Machine
12. Case Manager Review System
13. Edge Cases & Flag System
14. Navigation & Session Behavior
15. Prototype Scope & Constraints
16. Component Architecture
17. Interaction Flows
18. Acceptance Criteria
19. Future Considerations

---

## 1. Executive Summary

### What We're Building

A client-facing web portal that transforms the Canadian Citizenship by Descent application process from a confusing, document-heavy, multi-email experience into a guided, intelligent, and emotionally satisfying 20-minute workflow. The portal also includes a lightweight Case Manager Dashboard for reviewing and approving client applications.

### Why

Bill C-3 (in force December 15, 2025) retroactively eliminated the first-generation limit on citizenship by descent, creating a surge of new applicants — primarily Americans discovering they are already Canadian citizens. These clients are motivated and want to move fast. Our current process (emailing forms, guides, and checklists back and forth with a Case Manager) is slow, confusing, and does not scale.

### Success Metrics

| Metric | Current State | Target |
|---|---|---|
| Client active time to complete application | 2–4 hours spread over weeks | ~20 minutes total |
| Case Manager time per file | 30–60 minutes | 10–20 minutes |
| Client questions to Case Manager during application | 5–10 emails | 0–2 messages |
| Client satisfaction | Unmeasured | NPS > 70 |
| Application error rate at submission | ~15% returned by IRCC | < 3% |

### Scope

This PRD covers the **prototype** — a fully functional simulation of the client experience from initial contact through post-submission tracking, plus a lightweight Case Manager Dashboard for simulating the review workflow. The prototype is designed to run locally and facilitate rapid design iteration. It is not production-ready and does not include real OCR, authentication, database persistence, or payment processing.

---

## 2. Product Vision & Principles

### Vision Statement

"Trace your family's connection to Canada."

The portal should feel like a concierge service, not a government form. The client's emotional arc is:

**Excitement → Momentum → Triumph → Confidence**

### Design Principles

1. **Chain-first.** The chain of descent is the central metaphor, navigation system, and progress indicator. Everything revolves around building and verifying the chain.

2. **Hide the bureaucracy.** The client never sees "CIT-0001 Section 8" or "IMM 5476." They see "About You," "About Your Mother," "Your Representative." Government form structure is an implementation detail for the Case Manager — not the client.

3. **Assume and auto-fill aggressively.** Every field that can be derived, defaulted, or extracted from documents should be. The client should only answer questions that genuinely require their input.

4. **Momentum over caution.** The tone is "congratulations, let's make this official" — not "here's a complicated legal process." Avoid hedging language, excessive disclaimers, and processing-time anxiety on early screens.

5. **Multi-session by design.** Most clients won't have every document ready in one sitting. The portal should feel welcoming on return — "here's where you left off" — not punishing.

6. **Human seal, digital speed.** The software does 95% of the work. The Case Manager provides the trust signal. The client should feel a human is watching over their case without needing to interact with one.

---

## 3. User Personas

### Primary: The Excited American

**Demographics:** 25–55 years old, US-based, likely discovered their Canadian eligibility through social media or news coverage of Bill C-3. May have a parent or grandparent born in Canada.

**Mindset:** Motivated, impatient, somewhat anxious about paperwork. Wants a backup plan. Not an immigration expert — doesn't know what CIT-0001 is and doesn't want to.

**Needs:** Speed, clarity, confidence that it's being handled correctly. Willing to pay for a premium experience.

**Pain points with current process:** Overwhelmed by form length (14 pages), confused by government terminology, unsure which sections apply, afraid of making a mistake that delays the application.

### Secondary: The Case Manager (Victoria)

**Demographics:** Immigration professional at Cohen Immigration Law. Manages dozens of citizenship files simultaneously.

**Mindset:** Efficient, detail-oriented, wants to catch errors fast without hand-holding clients through basic questions.

**Needs:** Pre-screened, pre-filled applications that only need a final quality check. Clear flags for edge cases that require attorney escalation. Minimal back-and-forth with clients.

**Pain points with current process:** Spends too much time answering repetitive client questions, manually reviewing forms for basic errors, and chasing missing documents.

---

## 4. Journey Overview

### Pre-Portal: Sales Call

The sales agent collects the client's contact information and credit card over the phone. The client is charged a flat fee of USD $1,500.00. The retainer agreement is signed via email (DocuSign or equivalent). Once complete, the client receives a link to the portal.

**Data passed to portal from sales:** First name, last name, email, phone, home address, mailing address (if different).

### Portal Journey

```
[Sales Screen]          Sales agent collects contact info + payment
      │
      ▼
[Welcome]               "Trace your family's connection to Canada"
      │
      ▼
[Tell Your Story]       Conversational Q&A with chain sidebar (~3 min)
      │                  Establishes chain structure, determines required docs
      ▼
[Gather Proof]          Upload docs, build chain (multi-session, ~15 min total)
      │                  AI extracts data, auto-fills form fields
      │                  ★ Celebratory moment when chain is complete
      ▼
[Confirm Details]       Review pre-filled summary, fill gaps (~3 min)
      │
      ▼
[Team Review]           CM reviews via CM Dashboard (async, 1–2 days)
      │                  CM flags issues → client fixes → re-submits (if needed)
      ▼
[Sign & Submit]         Download PDFs, print, sign, mail
                         Track: AOR → Approval → Passport upsell
```

### Step Bar Labels (Client-Facing)

The step bar uses these labels throughout the portal:
1. Tell Your Story
2. Gather Proof
3. Confirm Details
4. Team Review
5. Sign & Submit

### Gating Logic

| Transition | Gate |
|---|---|
| Sales Screen → Welcome | Contact info + payment complete |
| Welcome → Tell Your Story | CTA click ("Begin Your Application") |
| Tell Your Story → Gather Proof | All intake questions answered |
| Gather Proof → Confirm Details | All required documents uploaded AND chain complete |
| Confirm Details → Team Review | Client clicks "Submit for Review" |
| Team Review → Sign & Submit | Case Manager approves (via CM Dashboard) |

---

## 5. Screen-by-Screen Specifications

### 5.0 Sales Screen

**Purpose:** Simulate the sales agent collecting client info and payment. This screen exists only in the prototype to create a realistic flow and populate client contact data.

**Layout:** Centered card, max-width 500px, clean payment-form aesthetic (Stripe Checkout style).

**Label:** Show "SALES AGENT VIEW" in a subtle badge/banner at the top, making it clear this is not the client-facing experience.

**Fields:**
- First name (text input, required)
- Last name (text input, required)
- Email address (text input, required)
- Phone number (text input, required)
- Home address: street, unit (optional), city, state/province, country, postal/ZIP code (required)
- Mailing address: checkbox "Mailing address is the same as home address" (default checked), expandable fields if unchecked
- Credit card: number, expiry, CVV (mock — no validation, just visual)

**Line item:** "$1,500.00 USD — Citizenship by Descent Application"

**CTA:** "Pay $1,500.00 USD"

**Behavior:** On submit, data is stored in client profile. Smooth transition to Welcome screen.

---

### 5.1 Welcome Screen

**Purpose:** Set expectations, build excitement, single CTA to begin.

**Layout:** Centered single-column, max-width ~700px, generous whitespace.

**Content hierarchy:**

1. **Personalized badge:** "★ Welcome, [First Name]"

2. **Hero headline (H1):** "Trace your family's connection to Canada"

3. **Subtitle (H2):** "As a Canadian citizen by descent, you already hold citizenship — this application provides the official proof. We'll handle the paperwork."

4. **Three-step overview** (card-based, clean layout with icon + text):
   - Step 1: "Tell us your story" — "A few questions to map your path to citizenship. ~5 minutes."
   - Step 2: "Upload your documents" — "Birth certificates, IDs, and family records — at your own pace."
   - Step 3: "Review and submit" — "Our team reviews everything, you sign, we handle the rest."

5. **CTA button:** "Begin Your Application →"
   - Secondary text below: "Most clients finish in about 20 minutes"

6. **Info callout** (subtle):
   - "Have your birth certificate and any family documents nearby. Don't have everything? No problem — you can always come back and add more later."

**Design notes:**
- Do NOT show processing times (11 months), fees, or legal language on this screen
- The step bar does NOT appear on this screen (it begins on the next screen)

---

### 5.2 Tell Your Story (Intake Screen)

**Purpose:** Conversational Q&A that establishes the chain of descent, determines which documents are needed, and pre-resolves several CIT-0001 sections.

**Layout:** Two-column desktop layout.
- Left column (~63%): Chat conversation interface
- Right column (~35%): Chain of descent sidebar (sticky on scroll)

**The step bar appears starting from this screen onward**, with "Tell Your Story" highlighted as the current step. Steps are visible but NOT clickable during intake — the client must complete the intake sequentially.

#### Left Column: Chat Interface

**Header:** "Tell us about your family" with a "Start Over" link.

**Interaction pattern:**
- Each question appears as a chat bubble from the firm (with firm icon)
- Brief typing indicator (3 animated dots, ~700ms) before each question appears
- Answer options appear as clickable pill buttons below the question
- After the client clicks an answer, both the question and their response remain visible (chat history)
- Free-text inputs (dates) use a simple input field with a "Continue" button

**Educational annotations:** Several questions include gray helper text below the main question, providing context to help the client answer correctly. This is part of the question bubble, not a separate message.

| Question | Helper Text |
|---|---|
| Q4: Grandparent status | "This includes grandparents who were born in Canada or who became Canadian citizens through naturalization (immigration)." |
| Q6: Pre-1977 foreign citizenship | "Before 1977, acquiring foreign citizenship could cause the loss of Canadian status. This is important for your application." |
| Q7: Quebec ancestors | "Quebec birth certificates issued before January 1, 1994 are not accepted by the Canadian government. A replacement certificate may be required." |
| Q8: Name changes | "This includes name changes through marriage, divorce, court order, or any other legal process." |
| Q10: Name/DOB/gender change | "Your certificate will normally show the details from your birth certificate." |
| Q11: Birth cert changed/replaced | "For example, amended to include a step-parent, reissued by the government, etc. A standard certified copy does not count as changed." |

**Eligibility callout:** After the chain structure is established (after Q4/Q5 for multi-gen chains), show a green-tinted callout bubble:

> "Under the recent changes to Canada's Citizenship Act, you're eligible for citizenship by descent regardless of how many generations your family lived outside Canada. Let's keep going."

**End-of-intake summary:** After the final question, the chain visualization moves from the sidebar into the chat flow as a summary card:

```
┌─────────────────────────────────────────────────┐
│  ✦ Your path to citizenship                     │
│                                                  │
│  ○ You                                           │
│  │ You · By descent                              │
│  │                                               │
│  ○ Your Mother                                   │
│  │ Your Mother · By descent                      │
│  │                                               │
│  ◉ Your Grandparent                              │
│    Your Grandparent · Born in Canada             │
│    ✓ Anchor — Born in Canada                     │
│                                                  │
│  Based on what you've told us, you appear to be  │
│  eligible for Canadian citizenship by descent    │
│  through your [grandparent/parent], who was      │
│  [born in/naturalized in] Canada.                │
│  Here's what we'll need from you: X documents.   │
└─────────────────────────────────────────────────┘

  [Continue to Your Application →]  [Save & Continue Later]
```

See Section 8 (Intake Logic Engine) for the complete question flow and branching logic.

#### Right Column: Chain Sidebar (Sticky)

The chain builds progressively as the client answers questions:
- After Q1 ("Outside Canada"): "You" node appears
- After Q2 ("My mother"): "Your Mother" node appears
- After Q3 ("No, born outside Canada") → Q4 ("Born in Canada"): "Your Grandparent" node appears with "Anchor" badge

Each node shows: name placeholder, relationship label, citizenship basis (once determined), and anchor badge on the anchor node.

When intake completes: the sidebar chain fades as the summary card appears inline in the chat.

---

### 5.3 Gather Proof (Document Upload Screen)

**Purpose:** The core product experience. A persistent workspace where clients upload documents, watch their chain of descent fill in, and return across multiple sessions.

**Layout:** Two-column on desktop.
- Left column (~63%): Document upload area, organized by person
- Right column (~35%): Chain visualization (sticky sidebar)

**This is the home screen of the portal after intake.** Every subsequent login returns the client here (unless they were on a later screen).

#### Right Column: Chain Visualization

Vertical chain diagram, anchor ancestor at top, applicant at bottom.

**Node anatomy:**
- Status icon (empty/partial/complete/flagged)
- Person's name (populated from documents, or placeholder like "Your Mother")
- Relationship label + key detail (e.g., "Mother · Born Toronto, ON")
- Mini progress bar showing X/Y docs

**Node states:**

| State | Visual | Trigger |
|---|---|---|
| Empty | Gray outline, dashed border | No documents uploaded |
| Partial | Amber fill, solid border | Some documents uploaded |
| Complete | Green fill, solid border | All required documents uploaded and extracted |
| Flagged | Red border, warning icon | Validation error or CM flag |

**Connector line states:**

| State | Visual |
|---|---|
| Unverified | Dashed gray line |
| Verified | Solid green line (animates when both connected nodes complete) |

**Interactions:** Clicking a node scrolls the left column to that person's document section.

**"Chain Complete" celebration:**
- Triggers when all in-chain nodes are complete and all connectors verified
- Nodes pulse briefly, connectors animate to solid
- Prominent success banner within the sidebar: "Your chain of descent is verified!"
- "Review Your Application →" button appears at the TOP and BOTTOM of the left column

#### Left Column: Document Upload Area

**Organization:** Sections grouped by person, matching the chain node order (anchor at top, applicant at bottom).

**Subtle guidance text** at the top: "Start with whichever documents you have handy — there's no required order."

**Progress summary bar** (top of left column):
- "X of Y required documents uploaded"
- Visual progress bar
- When complete: "All documents received — ready to review your application"

**Section anatomy (per person):**
- Section header: "About Your [Relationship]" (e.g., "About Your Maternal Grandparent")
- List of document rows

**Document row anatomy:**
- Status icon: upload icon (pending), spinner (extracting), checkmark (uploaded), warning (issue)
- Label: human-readable document name (e.g., "Birth certificate")
- Description: brief explanation
- Person badge: color-coded (e.g., "YOU" blue, "PARENT" amber, "GRANDPARENT" green)
- Required/Optional label
- Status: "Upload" button / "Extracting..." / "✓ Uploaded" / "⚠ Issue"

**Upload interaction:**
1. Client clicks "Upload" (opens file dialog) or drags a file
2. File uploads, status changes to "Extracting data..."
3. Simulated extraction (1–2 seconds in prototype)
4. Extraction results appear inline below the document row as a grid of key-value pairs with confidence indicators
5. Document status → "✓ Uploaded"
6. Chain node updates

**Validation checks on upload:**

| Check | Message |
|---|---|
| Wrong document type | "This doesn't appear to be a [expected type]. Please check and re-upload." |
| Expired document | "This document appears to be expired. IRCC requires valid identification." |
| Not English/French | "This document appears to be in [language]. A certified translation will be required." |
| Name mismatch | "The name on this document differs from [other doc]. Please verify." |

**Waitlist CTA for document retrieval** (bottom of left column):

> **Missing a document?**
> Don't have everything right now? No problem — save your progress and come back anytime.
>
> **Need help finding documents?**
> We're building a document retrieval service that will locate birth certificates, citizenship records, and other vital documents on your behalf.
>
> [Join the Waitlist]
>
> *(After clicking: button changes to "✓ You're on the waitlist!" and becomes disabled)*

**Multi-session behavior:**
- On return, client sees the document upload screen with current state preserved
- Subtle banner: "Welcome back, [Name]. Pick up where you left off."
- Previously uploaded documents show their extraction results
- Chain visualization shows current node states

**Additional elements:**
- Photo specifications card (expandable) — Canadian photo requirements + US citizen warning
- Government fee card — $75 CAD with link to IRCC payment portal

---

### 5.4 Confirm Details Screen

**Purpose:** Present the pre-filled application as a clean, human-readable summary. The client reviews, fills any remaining gaps, and submits for review.

**Layout:** Single-column, max-width ~800px. Card-based layout grouped by person.

**Key design principle:** This is a confirmation screen, not a form. The mental model is "review your order before checkout." ~80% of content is pre-filled and shown as read-only. Only genuine gaps require input.

**Header:**
- H1: "Confirm your application"
- Subtitle: "We've pre-filled most of your application from your documents. Review the details below and fill in anything we've marked."
- Stats bar: "X fields auto-filled · Y fields need your input"

**All fields must be editable.** Two display patterns:

*Auto-filled field:* Show value as text with source badge (e.g., "✓ Birth cert"). Subtle "Edit" button/pencil icon. Clicking converts to editable input.

*Field needing input:* Show as editable input field with "✎ Your input needed" badge. More prominent visual highlight.

*Field needing verification:* Subtle amber highlight with "Please verify" note (e.g., registration numbers).

#### Card 1: "About You"

| Field | Source | Client Action |
|---|---|---|
| Full name (surname + given) | Birth certificate | Verify (editable) |
| Date of birth | Birth certificate | Verify (editable) |
| Place of birth | Birth certificate | Verify (editable) |
| Country of birth | Birth certificate | Verify (editable) |
| Gender | Birth certificate | Verify (editable) |
| Height | Driver's license (if available) | Verify or enter (editable) |
| Eye color | Driver's license (if available) | Verify or enter (editable) |
| Other names used | Not extractable | Enter if applicable (editable) |
| Email | Sales screen | Verify (editable) |
| Phone | Sales screen | Verify (editable) |
| Home address | Sales screen | Verify (editable) |
| Mailing address | Sales screen ("Same as home?" toggle) | Verify (editable) |
| Birth cert changed/replaced? | Intake Q11 | Show answer (editable) |
| Birth cert explanation (if changed) | Intake follow-up | Conditional — show if "Yes" (editable) |
| Lived in Canada? | Intake Q12 | Show answer (editable) |
| Date entered Canada | Intake follow-up | Conditional — show if "Yes" (editable) |

#### Card 2: "About Your [Mother/Father]" (Canadian Parent)

| Field | Source | Client Action |
|---|---|---|
| Full name | Parent's birth cert + applicant's birth cert | Verify (editable) |
| Other names (maiden name, etc.) | Marriage cert / client input | Enter if applicable (editable) |
| Date of birth | Parent's birth certificate | Verify (editable) |
| Place of birth | Parent's birth certificate | Verify (editable) |
| Country of birth | Parent's birth certificate | Verify (editable) |
| Birth cert registration # | Parent's Canadian birth cert | **Verify — critical, highlighted** (editable) |
| Relationship to you | Default: "Biological parent" | Dropdown (editable) |
| How they became Canadian | Auto-derived ("Born in Canada") | Verify (editable) |
| Citizenship cert # | If parent naturalized | Conditional (editable) |
| Date of marriage | Marriage cert / client input | Verify or enter (editable) |
| Place of marriage | Marriage cert / client input | Verify or enter (editable) |
| Date of death | Client input | Conditional — enter if applicable (editable) |
| Date first entered Canada | Client input | Enter if applicable (editable) |
| Left Canada >1yr before 1977? | Conditional on parent DOB < 1977 | Show if applicable (editable) |
| Left Canada details (from/to/destination) | Conditional — only if "Yes" above | Show if applicable (editable) |
| Citizen of other country before 1977? | Conditional on parent DOB < 1977 | Show if applicable (editable) |
| Citizen details | Conditional — only if "Yes" above | Show if applicable (editable) |

*Note: Pre-1947 questions (born Canada before 1947, naturalized British subject, etc.) auto-resolve from parent's DOB. Surface only if parent DOB < 1947, which is extremely rare.*

#### Card 3: "About Your [Father/Mother]" (Non-Canadian Parent)

A lighter card with only the fields Section 8 requires.

| Field | Source | Client Action |
|---|---|---|
| Full name | Applicant's birth certificate | Verify (editable) |
| Other names | Client input | Enter if applicable (editable) |
| Date of birth | Often not extractable | Enter (editable) |
| Country of birth | Applicant's birth cert (partial) | Verify or enter (editable) |
| Citizenship status | Pre-set: "Not a Canadian citizen" | Verify (editable) |
| Relationship to you | Default: "Biological parent" | Dropdown (editable) |
| Date of marriage | Auto-synced from Canadian parent | Verify (editable) |
| Place of marriage | Auto-synced from Canadian parent | Verify (editable) |
| Date of death | Client input | Conditional — enter if applicable (editable) |

#### Card 4: "About Your Grandparent" (only for 2+ generation chains)

| Field | Source | Client Action |
|---|---|---|
| Full name | Grandparent's docs | Verify (editable) |
| Other names | Client input | Enter if applicable (editable) |
| Date of birth | Grandparent's docs | Verify (editable) |
| Country of birth | Grandparent's docs | Verify (editable) |
| Birth cert registration # | If born in Canada | Verify (editable) |
| Citizenship cert # | If naturalized | Verify (editable) |
| How obtained citizenship | Auto-derived | Verify (editable) |
| Date of death | Client input | Conditional — enter if applicable (editable) |

#### Card 5: "Your Certificate & Representative"

| Field | Source | Client Action |
|---|---|---|
| Certificate type | Intake | Displayed (editable) |
| Language | Default English | Displayed (editable) |
| Representative | "Olivia Cohen, Cohen Immigration Law" | Read-only |

Info note: "Once you appoint a representative, all government correspondence will be directed to Cohen Immigration Law, not to you directly. We will keep you updated at every step through this portal."

#### Bottom Section

- Pre-submission checklist (auto-checked):
  - ✅ All required documents uploaded
  - ✅ Chain of descent verified
  - ✅ Application details confirmed
- Stats: "X of Y fields auto-filled from your documents. Z fields completed by you."
- CTA: "Submit for Review →"
- Reassurance: "Your application will be reviewed by your Case Manager before anything is sent to the government. You will have a chance to make corrections if needed."

---

### 5.5 Team Review Screen

**Purpose:** Async status dashboard while the Case Manager reviews. Handles the feedback loop if changes are needed. The CM takes action via the separate CM Dashboard (Section 6).

**Layout:** Centered single-column, max-width 700px.

**No demo toggles in client view.** The review status is controlled entirely through the CM Dashboard.

#### State 1: Automated Checks (Transient — ~5 seconds)

When client clicks "Submit for Review," they see the pipeline animating:

1. Completeness check → ✓ Done (1.5s)
2. Consistency check → ✓ Done (1.5s)
3. Edge case analysis → ✓ Done (1.5s)
4. Case Manager review → "Queued" (does NOT auto-complete)

After the first three checks complete, transitions to State 2.

#### State 2: Waiting for Review (Persistent Default)

The client stays here until the CM takes action via the CM Dashboard.

- Shield icon + "Your application is under review"
- "Victoria Rukaite is reviewing your documents and forms."
- Automated checks shown as complete
- "Case Manager review" shown as "In progress"
- "Most reviews are completed within 1–2 business days."
- CM card: Victoria Rukaite name + avatar. "Have a question?" link.
- **No CM email address** — all communication in-platform
- Messages section: thread + input. "We typically respond within one business day."
- Client can send messages while waiting
- Client CANNOT proceed until CM takes action

#### State 3A: Changes Requested

Triggered when CM flags items via CM Dashboard.

- Warning icon + "Victoria has flagged X items for your attention"
- Flag cards, each showing:
  - Flag target (document or field name)
  - CM's message describing the issue
  - Action buttons: "Go to Gather Proof" or "Go to Confirm Details" + "Mark as Fixed"
- "Re-submit for Review" button — disabled until ALL flags marked as fixed
- Clicking "Re-submit" returns to State 2 (Waiting)
- Messages section remains visible and functional

**Flow:** Client fixes issues → marks flags as fixed → re-submits → back to Waiting → CM reviews again via Dashboard → CM can approve or flag again. This loop repeats until CM approves.

#### State 3B: Approved

Triggered when CM approves via CM Dashboard.

- Celebration icon (green checkmark)
- "Your application has been approved by our team!"
- "Everything looks great. The final step is to sign and mail your forms."
- Application summary card: type, chain, certificate type, documents submitted
- CTA: "Proceed to Sign & Submit →"
- CM card + messages section

---

### 5.6 Sign & Submit Screen

**Purpose:** Guide the client through physical signing and mailing, then serve as the long-term progress tracker.

**Layout:** Single-column, max-width 700px. Two main sections.

#### Section A: Sign & Mail Your Forms

**Step-by-step numbered cards:**

1. **Download your completed forms**
   - Button: "Download CIT-0001 (PDF)"
   - Button: "Download IMM 5476 (PDF)"
   - Note: "These forms have been pre-filled with your information. Do not modify them."

2. **Print both forms**
   - "Print on standard letter-size paper (8.5" × 11")."

3. **Sign the forms in black ink**
   - CIT-0001: "Sign on page 9, inside the signature box."
   - IMM 5476: "Sign Section E on page 4."
   - Warning callout: "⚠ Do not sign until instructed. Signatures must be less than 90 days old when IRCC receives the application. Your Case Manager will confirm when to sign."

4. **Check the declaration boxes**
   - "CIT-0001 Section 16: Read and check each of the five declaration checkboxes on page 8."

5. **Prepare your mailing envelope**
   - Checklist with checkboxes:
     - ☐ Signed CIT-0001 form
     - ☐ Signed IMM 5476 form
     - ☐ Two passport-size photos (Canadian spec: 50mm × 70mm)
     - ☐ Government fee receipt ($75 CAD)
   - Expandable photo specifications card:
     - Size: 50mm × 70mm (2" × 2¾")
     - Face height: 31–36mm
     - Background: Plain white
     - Expression: Neutral, eyes open, mouth closed
     - Taken within last 6 months
     - Back of one photo: name, DOB, studio name/address, date taken
     - US citizen note: "Standard US passport photos are too small. Request Canadian dimensions specifically."
   - Government fee card: $75 CAD per application + IRCC payment link

6. **Mail to our office**
   - Cohen Immigration Law mailing address (prominently displayed)
   - "Send via tracked mail. We recommend USPS Priority Mail or FedEx."

7. **Email a scanned copy**
   - "For safekeeping, please also email a scanned copy of your signed forms to victoria@cohenimmigration.com"

**CTA:** "I've mailed my forms" → marks status and transitions to progress tracker

#### Section B: Progress Tracker

Vertical timeline:

| Step | Status | Detail |
|---|---|---|
| 1. Application prepared | ✅ | "Your forms and documents are ready." |
| 2. Case Manager approved | ✅ | "Reviewed by Victoria Rukaite." |
| 3. Signed forms received | ⏳ | "We've received your signed forms at our office." |
| 4. Submitted to IRCC | ⏳ | "Your application has been submitted to the government." |
| 5. Acknowledgement of Receipt | ⏳ | "IRCC confirms they've received your application. ~2–4 weeks after submission." |
| 6. *Additional info requested* | *(conditional)* | "IRCC has requested additional information." |
| 7. Application approved | ⏳ | "Your citizenship certificate has been issued. ~9–11 months from submission." |

**Estimated completion:** "Based on current processing times, we expect your citizenship certificate by [month, year]."

**Passport upsell card:**
- "After you receive your citizenship certificate, you can apply for a Canadian passport. Cohen Immigration Law can help with that too."
- CTA: "Learn About Passport Services →"

**Info callouts:**
- "Your citizenship certificate is not a travel document. Do not cancel other passports until you have your Canadian passport in hand."
- "Processing times are set by IRCC and may change. We will notify you of any updates."

---

## 6. Case Manager Dashboard

### Overview

A separate mini-application accessible via a header button. Simulates the CM's view and allows the prototype user to control the review flow (approve applications or flag items).

### Access

A **"CM Dashboard"** button in the top-right area of the header, always visible. Clicking it opens the CM Dashboard as a **separate view** — the entire screen changes. The header updates to show "CM Dashboard" branding with a "← Back to Client View" button.

This should feel like switching to a different application.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Cohen Immigration Law — Case Manager Dashboard                  │
│  Logged in as: Victoria Rukaite        [← Back to Client View]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Client File ────────────────────────────────────────────┐   │
│  │  Client: Iliana Vasquez                                   │   │
│  │  Status: [current status badge]                           │   │
│  │  Submitted: [date]                                        │   │
│  │  Chain: X-generation                                      │   │
│  │  Certificate type: Paper/Electronic                       │   │
│  │  Documents: X uploaded                                    │   │
│  │                                                           │   │
│  │  Documents Submitted:                                     │   │
│  │  ✓ [List of uploaded documents with status]               │   │
│  │  ○ [Optional documents not uploaded]                      │   │
│  │                                                           │   │
│  │  Application Summary:                                     │   │
│  │  [Key fields: name, DOB, parents, chain, cert type]       │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Review Actions ──────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  [✓ Approve Application]                                   │   │
│  │                                                            │   │
│  │  — or —                                                    │   │
│  │                                                            │   │
│  │  Flag items for client attention:                          │   │
│  │  Target: [Dropdown: document or form field]                │   │
│  │  Message: [Text area for CM's note]                        │   │
│  │  [+ Add Flag]                                              │   │
│  │                                                            │   │
│  │  Current flags:                                            │   │
│  │  ⚠ [Flag 1 — target + message]                            │   │
│  │  ⚠ [Flag 2 — target + message]                            │   │
│  │                                                            │   │
│  │  [Send Flags to Client]                                    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Messages ────────────────────────────────────────────────┐   │
│  │  [Shared message thread — same data as client view]       │   │
│  │  [CM can send messages here]                              │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### CM Actions

**Approve Application:**
- Confirmation dialog: "Are you sure? This will notify the client to proceed to signing."
- On confirm: review status → "approved"
- Client view shows State 3B (Approved)

**Flag Items:**
- Target dropdown options: all uploaded document types + form field options + "General note"
- CM writes a message per flag
- Multiple flags can be added
- "Send Flags to Client" dispatches all flags
- Review status → "changes_requested"
- Client view shows State 3A (Changes Requested)

**Re-Review:** After client fixes and re-submits:
- CM Dashboard shows "Re-submitted for review"
- Previous flags shown as "Client marked as fixed"
- CM can approve or create new flags

### Messages

Shared thread between CM and client views. CM can read and respond to client messages.

---

## 7. Data Model

### 7.1 Client Profile

```
client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  home_address: {
    street: string
    unit: string | null
    city: string
    province_state: string
    country: string
    postal_code: string
  }
  mailing_address: Address | null       // null = same as home
  date_of_birth: string                 // YYYY-MM-DD, from birth cert
  place_of_birth: string
  country_of_birth: string
  gender: string                        // "F" | "M" | "X"
  height: string
  eye_color: string
  other_names: string[]
  has_lived_in_canada: boolean
  date_entered_canada: string | null
  language_preference: "English" | "French"
  certificate_type: "Paper" | "Electronic"
  uci_number: string                    // default "NA"
  wants_name_change: boolean            // default false
  birth_cert_changed: boolean | null
  birth_cert_explanation: string | null
  portal_status: PortalStatus
  case_manager_id: string
  created_at: datetime
  updated_at: datetime
}

enum PortalStatus {
  SALES
  INTAKE
  GATHERING          // uploading documents
  CONFIRMING
  IN_REVIEW
  CHANGES_NEEDED
  APPROVED
  SIGNING
  MAILED
  SUBMITTED
  AOR_RECEIVED
  INFO_REQUESTED
  APPROVED_IRCC
}
```

### 7.2 Chain of Descent

```
chain {
  id: string
  client_id: string
  generation_count: number              // 1, 2, 3, 4+
  anchor_type: "born_in_canada" | "naturalized" | "british_subject_1947"
  is_complete: boolean
  status: "incomplete" | "complete" | "verified" | "flagged"
  nodes: ChainNode[]
  flags: ChainFlag[]
}

chain_node {
  id: string
  chain_id: string
  person_type: "applicant" | "canadian_parent" | "non_canadian_parent" |
               "grandparent" | "great_grandparent"
  relationship_label: string
  is_anchor: boolean
  is_in_chain: boolean
  display_order: number

  // Personal details
  full_name: string | null
  surname: string | null
  given_names: string | null
  other_names: string | null
  date_of_birth: string | null
  place_of_birth: string | null
  country_of_birth: string | null
  is_deceased: boolean
  date_of_death: string | null

  // Citizenship details
  citizenship_status: "canadian_born" | "naturalized" | "by_descent" |
                      "non_canadian" | "unknown"
  citizenship_method: string | null
  citizenship_cert_number: string | null
  birth_cert_registration_number: string | null

  // Marriage
  date_of_marriage: string | null
  place_of_marriage: string | null

  // Parent-specific (for §8B)
  date_entered_canada: string | null
  left_canada_before_1977: boolean | null
  left_canada_details: string | null
  citizen_other_country_before_1977: boolean | null
  citizen_other_country_details: string | null
  born_canada_before_1947: boolean | null
  naturalized_british_subject_before_1947: boolean | null
  british_subject_resident_1947: boolean | null
  foreign_gov_employment: boolean | null

  // Relationship to applicant (§8A)
  relationship_type: "biological" | "adoptive" | "legal_at_birth" | null

  // Document tracking
  required_documents: string[]
  uploaded_documents: string[]
  node_status: "empty" | "partial" | "complete" | "flagged"
}

chain_flag {
  id: string
  chain_id: string
  node_id: string | null
  flag_type: "pre_1977" | "quebec" | "name_mismatch" | "adopted" |
             "uncertainty" | "attorney_review" | "multi_gen"
  severity: "info" | "warning" | "escalation"
  message: string
  resolved: boolean
}
```

### 7.3 Documents

```
document {
  id: string
  client_id: string
  chain_node_id: string
  document_type: DocumentType
  file_name: string
  file_url: string
  upload_date: datetime
  extracted_fields: ExtractedField[]
  extraction_confidence: "high" | "medium" | "low"
  extraction_complete: boolean
  validation_status: "pending" | "valid" | "invalid" | "warning"
  validation_errors: ValidationError[]
  cm_review_status: "pending" | "approved" | "flagged"
  cm_notes: string | null
}

enum DocumentType {
  APPLICANT_BIRTH_CERT
  APPLICANT_PHOTO_ID_1
  APPLICANT_PHOTO_ID_2
  PARENT_BIRTH_CERT
  PARENT_CITIZENSHIP_CERT
  PARENT_MARRIAGE_CERT
  GRANDPARENT_BIRTH_CERT
  GRANDPARENT_CITIZENSHIP_CERT
  GRANDPARENT_MARRIAGE_CERT
  GREAT_GRANDPARENT_CERT
  NAME_CHANGE_DOC
  FEE_RECEIPT
}
```

### 7.4 Review & Messaging

```
review {
  id: string
  client_id: string
  case_manager_id: string
  status: "pending" | "in_progress" | "changes_requested" | "approved"
  flags: ReviewFlag[]
  submitted_at: datetime
  reviewed_at: datetime | null
}

review_flag {
  id: string
  review_id: string
  target_type: "document" | "form_field" | "chain_node" | "general"
  target_id: string
  message: string
  status: "open" | "resolved"
  created_at: datetime
  resolved_at: datetime | null
}

message {
  id: string
  client_id: string
  sender_type: "client" | "case_manager"
  sender_name: string
  content: string
  created_at: datetime
  read_at: datetime | null
}
```

---

## 8. Intake Logic Engine

The intake is a branching conversational flow. Each question has an ID, display text, answer options, educational annotations, and downstream effects.

### Question Definitions

#### Q1: `born_where`
**Text:** "Let's start with the basics — where were you born?"
**Options:**
- "Outside Canada" → Proceed to Q2. Standard descent claim.
- "In Canada" → Set `jus_soli = true`. Simplified flow: skip chain, only need birth cert + IDs.

#### Q2: `which_parent`
**Text:** "Which parent do you believe has Canadian citizenship or Canadian ancestry?"
**Options:**
- "My mother" → `canadian_parent = "mother"`
- "My father" → `canadian_parent = "father"`
- "Both parents" → Follow-up: "Which parent's Canadian connection would be easier for you to document?" → client picks primary chain.
- "I'm not sure" → `canadian_parent = "unknown"`. Proceed with generic language. Flag for CM.

#### Q3: `parent_born`
**Text:** "Was your [Canadian parent] born in Canada?"
**Options:**
- "Yes, born in Canada" → `generation_count = 1`. First-gen. Chain: Applicant → Parent (anchor). §9 not required.
- "No, born outside Canada" → Proceed to Q4.
- "I'm not sure" → Proceed to Q4, flag uncertainty.

#### Q4: `grandparent_status` *(only if parent born outside Canada)*
**Text:** "Was one of your grandparents born in Canada, or did they become a Canadian citizen?"
**Helper text:** "This includes grandparents who were born in Canada or who became Canadian citizens through naturalization (immigration)."
**Options:**
- "Yes, born in Canada" → `generation_count = 2`. Chain: Applicant → Parent → Grandparent (anchor). §9 required.
- "Yes, naturalized as Canadian" → `generation_count = 2`. Need citizenship cert for grandparent.
- "The connection goes further back" → Proceed to Q5.
- "I'm not sure" → `generation_count = 2` (tentative). Flag for CM.

**[Eligibility callout appears here for multi-gen chains]:**
> "Under the recent changes to Canada's Citizenship Act, you're eligible for citizenship by descent regardless of how many generations your family lived outside Canada. Let's keep going."

#### Q5: `how_far` *(only if grandparent not the anchor)*
**Text:** "Do you know how far back your first Canadian ancestor was?"
**Options:**
- "Great-grandparent (3 generations)" → `generation_count = 3`. Need supplementary sheet.
- "4 or more generations" → `generation_count = 4`. Flag for attorney review.
- "I'm not sure — I need help" → Flag for attorney.

#### Q6: `pre_1977`
**Text:** "Did any ancestor in your Canadian line become a citizen of another country before February 15, 1977?"
**Helper text:** "Before 1977, acquiring foreign citizenship could cause the loss of Canadian status. This is important for your application."
**Options:**
- "No, or not that I know of" → No flag.
- "Yes" → Flag: `pre_1977_foreign_naturalization`. Alert inline.
- "I'm not sure" → Soft flag for CM.

#### Q7: `quebec`
**Text:** "Was any ancestor in your Canadian line born in the province of Quebec?"
**Helper text:** "Quebec birth certificates issued before January 1, 1994 are not accepted by the Canadian government. A replacement certificate may be required."
**Options:**
- "Yes" → Flag: `quebec_vital_records`.
- "No" → No flag.
- "I'm not sure" → Soft flag.

#### Q8: `name_changes`
**Text:** "Have you or any ancestor in the chain legally changed their name?"
**Helper text:** "This includes name changes through marriage, divorce, court order, or any other legal process."
**Options:**
- "No" → No flag.
- "Yes" → Add `NAME_CHANGE_DOC` to required documents. Flag for CM.

#### Q9: `section_6_check`
**Text:** "Would you like a different name, date of birth, or gender to appear on your citizenship certificate than what's on your birth certificate?"
**Helper text:** "Your certificate will normally show the details from your birth certificate."
**Options:**
- "No" → Section 6 = skip. (~90% of clients)
- "Yes" → Expand Section 6 on Confirm screen. Flag for CM.

#### Q10: `birth_cert_changed`
**Text:** "Was your birth certificate ever changed, amended, or replaced?"
**Helper text:** "For example, amended to include a step-parent, reissued by the government, etc. A standard certified copy does not count as changed."
**Options:**
- "No, it's the original record (or a standard certified copy)" → `birth_cert_changed = false`
- "Yes" → `birth_cert_changed = true`. Follow-up: "Please briefly describe why." (text input)

#### Q11: `lived_in_canada`
**Text:** "Have you ever lived in Canada?"
**Options:**
- "No" → Section 10 = "No."
- "Yes" → Follow-up: "When did you first move to Canada?" (date input)

#### Q12: `certificate_preference`
**Text:** "Would you prefer a paper certificate or an electronic certificate?"
**Helper text:** "Paper certificates are mailed to addresses in Canada or the US. Electronic certificates are delivered as a PDF via email."
**Options:**
- "Paper certificate" → `certificate_type = "Paper"`
- "Electronic certificate" → `certificate_type = "Electronic"`

### Intake Outputs Summary

| Output | Derived From |
|---|---|
| Chain structure (nodes + relationships) | Q1–Q5 |
| `generation_count` | Q3–Q5 |
| Required document checklist | `generation_count` + Q8 |
| Edge case flags | Q6, Q7, Q8, Q2/Q4/Q5 uncertainty |
| CIT-0001 §1 Language | Default: English |
| CIT-0001 §2 UCI | Default: "NA" |
| CIT-0001 §3 Reason | Default: "No" (not replacing) |
| CIT-0001 §4 Certificate type | Q12 |
| CIT-0001 §6 Name change | Q9 |
| CIT-0001 §7 Birth cert changed | Q10 |
| CIT-0001 §10 Lived in Canada | Q11 |
| CIT-0001 §15 Representative | Auto: Olivia Cohen |

---

## 9. Document Intelligence Layer

### 9.1 Extraction Rules by Document Type

**Applicant's Birth Certificate:**

| Extract | Maps To |
|---|---|
| Surname | `client.last_name`, CIT-0001 §5 Surname |
| Given name(s) | `client.first_name`, CIT-0001 §5 Given names |
| Date of birth | `client.date_of_birth`, CIT-0001 §5 DOB |
| Place of birth | `client.place_of_birth`, CIT-0001 §5 Place of birth |
| Country of birth | `client.country_of_birth`, CIT-0001 §5 Country |
| Sex/Gender | `client.gender`, CIT-0001 §5 Gender |
| Parent 1 name | `chain_node[canadian_parent].full_name` (partial) |
| Parent 1 birthplace | `chain_node[canadian_parent].place_of_birth` (partial) |
| Parent 2 name | `chain_node[non_canadian_parent].full_name` (partial) |
| Parent 2 birthplace | `chain_node[non_canadian_parent].place_of_birth` (partial) |

**Applicant's Driver's License:**

| Extract | Maps To |
|---|---|
| Full name | Cross-verify against birth cert |
| DOB | Cross-verify against birth cert |
| Height | `client.height`, CIT-0001 §5 Height |
| Eye color | `client.eye_color`, CIT-0001 §5 Eye colour |
| Document number | ID verification record |
| Expiry date | Validation: must not be expired |

**Applicant's Passport:**

| Extract | Maps To |
|---|---|
| Full name | Cross-verify; IMM 5476 §A.1 |
| DOB | Cross-verify |
| Expiry date | Validation |
| Nationality | Reference info |

**Parent's Canadian Birth Certificate:**

| Extract | Maps To |
|---|---|
| Full name | CIT-0001 §8 Parent name |
| Date of birth | CIT-0001 §8 Parent DOB |
| Place of birth | CIT-0001 §8 |
| Registration number | CIT-0001 §8 — **critical field** |
| Parent names (grandparents) | CIT-0001 §9 (if applicable) |

**Parent's Citizenship Certificate** (if naturalized):

| Extract | Maps To |
|---|---|
| Full name | CIT-0001 §8 |
| Certificate number | CIT-0001 §8B |
| Date of naturalization | Infer citizenship method |

**Parent's Marriage Certificate:**

| Extract | Maps To |
|---|---|
| Party names | Name linking / cross-verification |
| Date of marriage | CIT-0001 §8 |
| Place of marriage | CIT-0001 §8 |

**Grandparent's Birth Certificate / Citizenship Certificate:**

| Extract | Maps To |
|---|---|
| Full name | CIT-0001 §9 |
| Date of birth | CIT-0001 §9 |
| Country of birth | CIT-0001 §9 |
| Registration # / Certificate # | CIT-0001 §9 |

### 9.2 Validation Rules

| Rule | Severity | Message |
|---|---|---|
| Document type doesn't match slot | Error | "This doesn't appear to be a [expected type]." |
| ID document expired | Warning | "This document appears to be expired." |
| Name on birth cert ≠ name on ID | Warning | "Your name appears differently on these documents." |
| DOB mismatch between docs | Warning | "Date of birth differs between documents." |
| Parent name mismatch across docs | Warning | "Your parent's name appears differently." |
| Document not in English/French | Warning | "A certified translation will be required." |
| US client photo reminder | Info | "Canadian passport photos are larger than US photos." |

### 9.3 Prototype Simulation

Document extraction is simulated with mock data. Demo persona:

```
Applicant: Iliana Vasquez
  DOB: 1992-03-15
  Born: Los Angeles, California, USA
  Gender: F, Height: 5'7", Eyes: Brown

Canadian Parent (Mother): Maria Elena Torres Vasquez (née Torres)
  DOB: 1965-04-22
  Born: Toronto, Ontario, Canada
  Registration #: 1965-091-022891
  Marriage: Sept 14, 1988, Toronto, Ontario
  Citizenship: Born in Canada

Non-Canadian Parent (Father): Carlos Andres Vasquez
  DOB: 1963-08-10
  Born: Bogotá, Colombia
  Citizenship: Colombian

Grandparent (Maternal Grandmother): Lucia Diaz (née Diaz)
  DOB: 1940-05-17
  Born: Toronto, Ontario, Canada
  Registration #: 1940-091-114502
  Citizenship: Born in Canada

Grandparent (Maternal Grandfather): Roberto Carlos Torres
  DOB: 1938-11-03
  Born: Havana, Cuba
  Naturalized Canadian: June 11, 1958, Toronto
  Certificate #: N-4822-1958
  Deceased: 2019-02-14
```

The demo supports both 1-generation (mother born in Canada) and 2-generation (grandmother as anchor) flows depending on intake answers.

---

## 10. Form Auto-Fill Engine (CIT-0001 & IMM 5476)

### 10.1 CIT-0001 Complete Field Map

Every CIT-0001 field mapped to its data source. See the Confirm Details screen (Section 5.4) for the client-facing presentation.

| Section | Field | Source |
|---|---|---|
| §1 | Language: English | Default |
| §2 | UCI: "NA" | Default |
| §3 | Replacing certificate: No | Default — skip to §4 |
| §4 | Certificate type | Intake Q12 |
| §5 | Surname, Given names, DOB, Place/Country of birth, Gender | Applicant birth cert |
| §5 | Height, Eye colour | Driver's license or client input |
| §5 | Other names | Client input on Confirm screen |
| §6 | Requesting change: No (90%) / Yes | Intake Q9 |
| §7 | Birth cert original or changed | Intake Q10 |
| §8 Parent 1 | Name, DOB, Birthplace, Country | Parent's birth cert + applicant's birth cert |
| §8 Parent 1 | Registration # | Parent's Canadian birth cert — **critical** |
| §8 Parent 1 | Marriage date/place | Marriage cert or client input |
| §8 Parent 1 | Death date | Client input (conditional) |
| §8A Parent 1 | Relationship: Biological parent | Default; editable |
| §8B Parent 1 | Citizenship status | Auto-derived from chain |
| §8B Parent 1 | Citizenship cert # | If naturalized: from cert |
| §8B Parent 1 | Date entered Canada | Client input |
| §8B Parent 1 | Pre-1977 questions | Auto-resolved from DOB; else Confirm screen |
| §8C Parent 1 | Foreign gov employment | Auto "N/A" for born-outside applicants |
| §8 Parent 2 | Name, Country of birth | Applicant's birth cert |
| §8 Parent 2 | DOB, Other names | Client input |
| §8 Parent 2 | Marriage (synced) | Auto-synced from Parent 1 |
| §8A Parent 2 | Relationship | Default: Biological |
| §8B Parent 2 | Citizenship: "Not Canadian" | Pre-set |
| §9 | Grandparent details (if 2+ gen) | Grandparent's docs |
| §10 | Lived in Canada | Intake Q11 |
| §11 | Born before 1977: No | Auto-resolved from DOB |
| §12 | Born before 1950: No | Auto-resolved from DOB |
| §13 | Born on/after Dec 15, 2025: No | Auto-resolved from DOB |
| §14 | Contact info | Sales screen / client profile |
| §15 | Representative: Olivia Cohen | Hard-coded |
| §16 | Declarations + Signature | Deferred to physical signing |

### 10.2 IMM 5476 Complete Field Map

| Section | Field | Source |
|---|---|---|
| §A.1 | Name (as on passport/travel doc) | Client profile / extraction |
| §A.2 | DOB | Synced from CIT-0001 §5 |
| §A.3 | Email | Client profile |
| §A.4 | Application type: "Proof of Citizenship" | Hard-coded |
| §A.5 | UCI: "NA" | Synced |
| §B.6 | Representative: Olivia Cohen | Hard-coded |
| §B.7 | Type: Paid, law society (Quebec) | Hard-coded |
| §B.8 | Firm: Cohen Immigration Law | Hard-coded |
| §B.9 | Rep signature | Internal |
| §C–D | Cancel/Withdraw: N/A | Skipped |
| §E.12 | Client signature + date | Deferred to physical signing |

### 10.3 Auto-Fill Coverage (Typical 1-Gen Case)

| Category | Fields | % |
|---|---|---|
| Fully auto-filled | ~38 | ~62% |
| Auto-filled, client verifies | ~12 | ~20% |
| Client provides manually | ~8 | ~13% |
| Deferred to signing | ~3 | ~5% |

---

## 11. Chain of Descent: State Machine

### Node State Transitions

```
(created) → EMPTY → PARTIAL → COMPLETE → FLAGGED → COMPLETE (after fix)
```

### Chain-Level State

```
chain.status =
  if any node FLAGGED → "flagged"
  else if all in-chain nodes COMPLETE → "complete"
  else → "incomplete"
```

### Screen Gate

Confirm Details is accessible when `chain.status === "complete"` and no unresolved error-severity validation issues.

---

## 12. Case Manager Review System

### Review Workflow

```
Client submits from Confirm Details
        │
        ▼
Automated pre-checks run (~5 seconds):
  1. Completeness check ✓
  2. Consistency check ✓
  3. Edge case analysis ✓
  4. Case Manager review → "Queued"
        │
        ▼
Review enters "Waiting" state
(client waits; CM acts via CM Dashboard)
        │
        ├── CM approves ──────────► Client sees "Approved" → Sign & Submit
        │
        └── CM flags items ───────► Client sees flags → fixes → re-submits
                                           │
                                           ▼
                                    Back to "Waiting" state
                                    (loop until CM approves)
```

### Review Flag Types

| Type | Target | Example |
|---|---|---|
| `document_quality` | Document | "Scan too blurry to read registration number." |
| `document_missing` | Document type | "Marriage certificate needed for name linking." |
| `field_error` | Form field | "Registration number format doesn't match Ontario." |
| `field_missing` | Form field | "Please provide parent's date of birth." |
| `general` | None | "Quebec birth cert pre-1994 — replacement needed." |
| `attorney_escalation` | None | "Attorney review needed for pre-1977 question." |

---

## 13. Edge Cases & Flag System

| ID | Edge Case | Detection | Severity | Handling |
|---|---|---|---|---|
| EC-01 | Born in Canada | Intake Q1 | Info | Simplified flow |
| EC-02 | Both parents Canadian | Intake Q2 | Info | Client picks primary chain |
| EC-03 | Parent's status unknown | Intake Q2 | Warning | Proceed with docs; CM determines |
| EC-04 | 3+ generation chain | Intake Q4–Q5 | Warning | Add nodes; supplementary sheet |
| EC-05 | Pre-1977 foreign naturalization | Intake Q6 | Escalation | Potential chain-breaker |
| EC-06 | Quebec vital records pre-1994 | Intake Q7 | Warning | Replacement cert may be needed |
| EC-07 | Legal name change | Intake Q8 | Info | Add name change doc |
| EC-08 | Adopted applicant | Document analysis | Escalation | CIT-0001 cannot be used |
| EC-09 | Parent deceased | Confirm screen | Info | Date of death in §8 |
| EC-10 | Applicant born before 1977 | DOB from birth cert | Warning | Surface §11 questions |
| EC-11 | Applicant born before 1950 | DOB from birth cert | Warning | Surface §12 questions |
| EC-12 | Registration # vs certificate # | Parent's birth cert | Warning | Highlight for verification |
| EC-13 | Parent naturalized | Intake Q3 / docs | Info | Need citizenship cert |
| EC-14 | Documents not in English/French | Upload | Warning | Translation required |
| EC-15 | Expired ID | Upload | Warning | Must provide valid ID |
| EC-16 | Name mismatch across docs | Cross-doc check | Warning | Marriage cert may help |

---

## 14. Navigation & Session Behavior

### Step Bar

Visible from the start of intake onward. Steps are clickable for navigation with these rules:

| Current Screen | Step Bar Behavior |
|---|---|
| Tell Your Story | Steps visible but NOT clickable. Must complete sequentially. |
| Gather Proof | Can click "Confirm Details" (if unlocked). Cannot go back to intake. |
| Confirm Details | Can click "Gather Proof" (with warning dialog). Can click "Team Review" (if submitted). |
| Team Review (waiting) | Cannot navigate away while waiting for CM. |
| Team Review (flagged) | Can click "Gather Proof" or "Confirm Details" to fix issues. |
| Sign & Submit | Can click previous steps (view-only). |

"Tell Your Story" is NEVER clickable after intake completes. It shows a checkmark but does nothing on click. Intake answers are edited via the Confirm Details screen.

### Navigation Warning

When navigating backward from "Confirm Details" to "Gather Proof":

> "Going back to upload documents may update fields on your application. Any manual edits you've made will be preserved, but auto-filled fields may change if you upload new documents. Continue?"
>
> [Go Back] [Stay Here]

### Session Resume

When client returns after leaving:
- Land on the **last screen they were on**
- Show subtle banner: "Welcome back, [Name]. Pick up where you left off."
- All state preserved (uploads, chain status, intake answers, confirm edits)

---

## 15. Prototype Scope & Constraints

### Includes

- All screens: Sales (mock) → Welcome → Tell Your Story → Gather Proof → Confirm Details → Team Review → Sign & Submit
- Case Manager Dashboard as separate mini-application
- Intake branching logic (all questions with proper routing)
- Chain visualization with progressive building and state transitions
- Simulated document upload with mock extraction
- Simulated validation
- Confirm screen with all fields editable
- CM-controlled review flow (no auto-approve)
- Sign & Submit with progress tracker
- Chain Complete celebration
- Multi-session simulation (state persists in React state)
- Step bar navigation with gating rules
- Desktop-first responsive design

### Does NOT Include

- Real authentication / user accounts
- Real database persistence (state resets on refresh)
- Real OCR / document extraction
- Real PDF generation
- Real payment processing
- Real file upload to server
- Real email/messaging system
- Voice agent for intake
- Advanced document validation
- Document retrieval service (waitlist only)
- Mobile-optimized design
- Accessibility audit
- French language support
- Security review

### Tech Stack

- **Framework:** React 18 (JSX, no TypeScript)
- **Build tool:** Vite
- **Styling:** Inline styles with design token system + CSS for globals/animations
- **State:** `useReducer` + React Context
- **Fonts:** Google Fonts: Instrument Serif (display) + Source Sans 3 (body)
- **Icons:** Inline SVG components
- **Routing:** Internal state-based (no React Router)
- **Data:** Mock data defined as constants

### Design Tokens

```javascript
const T = {
  bg: "#F6F5F0",
  bgWarm: "#EFEDE6",
  card: "#FFFFFF",
  accent: "#1B3A2D",
  accentMid: "#2D5F45",
  accentLight: "#3A7D5C",
  accentPale: "#E2F0E8",
  maple: "#C41E3A",
  text: "#1C1C1A",
  textSec: "#5C5C56",
  textMut: "#9C9C94",
  success: "#1A7D46",
  successBg: "#E6F5ED",
  warn: "#B45309",
  warnBg: "#FEF7E6",
  error: "#C41E3A",
  errorBg: "#FDE8EC",
  blue: "#1E56A0",
  blueBg: "#E8F0FA",
  font: "'Source Sans 3', sans-serif",
  fontDisplay: "'Instrument Serif', Georgia, serif",
  radius: 14,
  radiusSm: 10,
}
```

---

## 16. Component Architecture

### Component Tree

```
App
├── SalesScreen (agent view)
├── Header
│   ├── FirmBranding
│   ├── StepBar (from intake onward)
│   ├── UserBadge
│   └── CMDashboardButton
├── WelcomeScreen
├── IntakeScreen (two-column)
│   ├── ChatColumn
│   │   ├── ChatBubble (firm message + optional helper text)
│   │   ├── TypingIndicator
│   │   ├── AnswerPills
│   │   ├── FreeTextInput
│   │   ├── EligibilityCallout
│   │   └── IntakeSummaryCard (end of intake)
│   └── ChainSidebar
│       ├── ChainNode (progressive)
│       └── ChainConnector
├── DocumentUploadScreen (two-column)
│   ├── ProgressBar
│   ├── DocumentUploadArea
│   │   ├── PersonSection
│   │   │   └── DocumentRow (upload/extracting/uploaded/error)
│   │   └── ...more sections
│   ├── ChainVisualization (sticky sidebar)
│   │   ├── ChainNode
│   │   ├── ChainConnector
│   │   └── ChainCompleteOverlay
│   ├── PhotoSpecsCard
│   ├── FeeCard
│   └── WaitlistCallout
├── ConfirmScreen
│   ├── StatsBar
│   ├── PersonCard (About You)
│   │   └── FieldRow (read-only/editable with source badge)
│   ├── PersonCard (Canadian Parent)
│   ├── PersonCard (Non-Canadian Parent)
│   ├── PersonCard (Grandparent — conditional)
│   ├── CertificateCard
│   ├── PreSubmitChecklist
│   └── SubmitButton
├── ReviewScreen
│   ├── AutomatedChecks (transient animation)
│   ├── WaitingState
│   ├── FlaggedState
│   │   └── FlagCard
│   ├── ApprovedState
│   ├── CaseManagerCard
│   └── MessageThread
├── SignSubmitScreen
│   ├── SigningInstructions (7 steps)
│   ├── PhotoSpecsCard
│   ├── FeeCard
│   ├── MailingChecklist
│   ├── ProgressTracker
│   └── PassportUpsellCard
└── CMDashboard (separate view)
    ├── CMHeader
    ├── ClientFileSummary
    ├── ReviewActions
    │   ├── ApproveButton
    │   └── FlagForm (target dropdown + message + add)
    └── MessageThread
```

---

## 17. Interaction Flows

### Flow 1: Happy Path (No CM Flags)

1. Sales agent fills Sales Screen → client receives link
2. Client lands on Welcome → clicks "Begin Your Application"
3. Tell Your Story: answers 12–13 questions with chain building in sidebar → sees summary card → clicks "Continue"
4. Gather Proof: uploads all required docs → chain turns green → celebration → clicks "Review Your Application"
5. Confirm Details: reviews pre-filled fields, fills gaps → clicks "Submit for Review"
6. Team Review: automated checks animate → pauses at "Waiting for review"
7. **User opens CM Dashboard** → reviews file → clicks "Approve"
8. **User returns to Client View** → client sees "Approved!" → clicks "Proceed to Sign & Submit"
9. Sign & Submit: downloads PDFs, follows mailing instructions

### Flow 2: CM Flags Items

1. Steps 1–6 same as Flow 1
2. **User opens CM Dashboard** → creates 2 flags → clicks "Send Flags to Client"
3. **User returns to Client View** → client sees 2 flagged items
4. Client clicks "Go to Gather Proof" → uploads corrected document → returns to Review
5. Client marks both flags as fixed → clicks "Re-submit for Review"
6. Back to "Waiting" state
7. **User opens CM Dashboard** → reviews again → approves (or flags again — loop continues)
8. **User returns to Client View** → client sees "Approved!" → proceeds

### Flow 3: Multi-Session

1. Steps 1–3 same
2. Client uploads 3 of 5 documents → closes browser
3. Client returns later → lands on Gather Proof screen with 3 docs shown
4. "Welcome back, Iliana" banner → uploads remaining 2 docs
5. Chain complete → continues to Confirm Details

---

## 18. Acceptance Criteria

### Sales Screen
- [ ] "SALES AGENT VIEW" label visible
- [ ] All contact fields required
- [ ] Mock credit card fields present
- [ ] Data persists to all subsequent screens

### Welcome Screen
- [ ] H1: "Trace your family's connection to Canada"
- [ ] Personalized "Welcome, [Name]" badge
- [ ] Three-step overview with correct labels
- [ ] No processing times, fees, or legal language

### Tell Your Story (Intake)
- [ ] Two-column layout: chat left, chain sidebar right
- [ ] Step bar visible with "Tell Your Story" highlighted
- [ ] Chain builds progressively as questions are answered
- [ ] Educational helper text shown beneath relevant questions
- [ ] Eligibility callout appears for multi-gen chains
- [ ] Birth cert changed/replaced question included in intake
- [ ] End-of-intake summary shows chain inline with eligibility statement and doc count
- [ ] "Save & Continue Later" button visible at end
- [ ] All branching paths work correctly (1-gen, 2-gen, 3+, born in Canada)

### Gather Proof
- [ ] Two-column: uploads left, chain sidebar right
- [ ] Documents organized by person matching chain order
- [ ] Upload triggers simulated extraction with animation
- [ ] Extraction results show inline with confidence indicators
- [ ] Validation errors surface immediately
- [ ] Chain nodes update in real time
- [ ] "Chain Complete" celebration when all docs uploaded (animation + banner)
- [ ] "Review Your Application" button at top AND bottom when complete
- [ ] Waitlist CTA with "Join the Waitlist" → "✓ You're on the waitlist!" behavior
- [ ] "Start with whichever documents you have handy" guidance text
- [ ] Progress bar shows X of Y required documents

### Confirm Details
- [ ] ALL fields editable (click-to-edit for auto-filled, direct input for gaps)
- [ ] Source badges on all auto-filled fields
- [ ] Visual hierarchy: auto-filled vs. verify vs. needs-input
- [ ] Mailing address with "Same as home?" toggle
- [ ] Non-Canadian parent: other names + date of death fields present
- [ ] Canadian parent: conditional pre-1977 sub-fields
- [ ] Canadian parent: citizenship cert # (if naturalized)
- [ ] Grandparent: birth cert registration # (if born in Canada)
- [ ] Pre-submit checklist with auto-checks
- [ ] "Submit for Review" button functional

### Team Review
- [ ] No demo toggles in client view
- [ ] No CM email shown
- [ ] Automated checks animate, then pause at "Waiting for review"
- [ ] Client can send messages while waiting
- [ ] Client cannot proceed until CM acts via Dashboard
- [ ] Flagged state: flag cards with "Go to..." and "Mark as Fixed"
- [ ] "Re-submit" enabled only when all flags marked fixed
- [ ] Re-submission returns to Waiting (loop works)
- [ ] Approved state: celebration + CTA

### CM Dashboard
- [ ] Accessible via header button
- [ ] Separate view with distinct header
- [ ] "← Back to Client View" returns to client's current screen
- [ ] Client file summary: status, chain, docs, key fields
- [ ] "Approve" button with confirmation dialog
- [ ] Flag form: target dropdown + message + add multiple
- [ ] "Send Flags to Client" dispatches to review screen
- [ ] Shared message thread
- [ ] Re-submission shows previous flags as "Client marked as fixed"
- [ ] CM can approve or flag again

### Sign & Submit
- [ ] 7 numbered steps with correct content
- [ ] PDF download buttons (mock)
- [ ] "Do not sign until instructed" warning
- [ ] Photo specs and fee info
- [ ] Progress tracker with all milestones
- [ ] Estimated completion date
- [ ] Passport upsell card

### Navigation & Session
- [ ] Step bar clickable per gating rules
- [ ] "Tell Your Story" not clickable after completion
- [ ] Back-navigation warning from Confirm → Gather Proof
- [ ] Session resume: returns to last screen
- [ ] "Welcome back" banner on return

---

## 19. Future Considerations

Out of scope for the prototype, documented for production planning:

- **Voice agent intake** — replace chat with conversational voice
- **Advanced document validation** — AI verification of document adequacy
- **Document retrieval service** — paid add-on to locate missing documents
- **Full Case Manager portal** — dashboard for managing multiple files
- **AI-assisted review** — agent evaluates applications with structured outputs
- **Real PDF generation** — programmatic CIT-0001 and IMM 5476 filling
- **Client authentication** — SSO or magic-link
- **Bilingual support** — full French language
- **Analytics** — funnel metrics, drop-off tracking
- **Mobile-optimized design** — responsive layouts for phone/tablet

---

*End of PRD — Version 2.0 (Consolidated)*
