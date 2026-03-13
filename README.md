# Cohen Immigration Law — Citizenship by Descent Portal

A polished, interactive prototype of a client-facing portal for Canadian citizenship by descent applications, built for Cohen Immigration Law.

## Overview

This portal guides clients through the full citizenship-by-descent workflow:

1. **Sales Intake** — Collect client info and payment (with demo autofill)
2. **Tell Your Story** — Conversational intake that builds a chain of descent in real time
3. **Gather Proof** — Document upload with simulated AI extraction and a visual chain verification sidebar
4. **Confirm Details** — Review auto-filled application fields, edit where needed
5. **Team Review** — Case manager approval flow with flag/resolve cycle
6. **Sign & Submit** — Step-by-step mailing instructions and post-submission progress tracker

A **Case Manager Dashboard** is also included for the CM to review applications, flag issues, send messages, and approve.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| State | React Context + `useReducer` |
| Styling | Design tokens + inline styles (no CSS framework) |
| Fonts | Instrument Serif (headings), Source Sans 3 (body) |
| Mock Data | Simulated document extraction, persona data |

Zero backend dependencies — everything runs client-side with mock data.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## Demo Flow

1. Click **⚡ Autofill for Demo** on the sales screen to skip form filling
2. Click **Pay** → **Begin Your Application**
3. Answer intake questions (Outside Canada → My mother → No → Yes → No × 5 → Paper certificate)
4. Click **Continue to Your Application**
5. Upload all documents (simulated — just click each Upload button)
6. Click **Review Your Application** → **Submit for Review**
7. Open **CM Dashboard** (top-right) to approve or flag items
8. Complete the Sign & Submit flow

## Project Structure

```
src/
├── App.jsx              # Router, header, step bar, back-nav modal
├── AppContext.jsx        # Global state (useReducer)
├── tokens.js            # Design tokens (colors, typography, spacing)
├── Icons.jsx            # SVG icon library
├── mockData.js          # Intake questions, personas, doc extraction
├── index.css            # Global styles, animations, fonts
│
├── SalesScreen.jsx      # Client intake + payment (with autofill)
├── WelcomeScreen.jsx    # Post-payment welcome
├── IntakeScreen.jsx     # Conversational intake + chain sidebar
├── GatherProofScreen.jsx # Document upload + chain visualization
├── ConfirmScreen.jsx    # Editable application review
├── ReviewScreen.jsx     # CM approval / flag resolution
├── SignSubmitScreen.jsx  # Mailing instructions + progress tracker
└── CMDashboard.jsx      # Case manager review panel
```

## Key Design Decisions

- **No router library** — Single-page app with screen state managed via context
- **Inline styles with tokens** — Consistent design system without CSS framework overhead
- **Mock AI extraction** — Documents simulate OCR with realistic extracted fields
- **Progressive chain building** — Chain of descent builds visually as the user answers questions
- **Prototype-first** — Designed for stakeholder demos, not production deployment

## License

Private — Cohen Immigration Law internal prototype.
