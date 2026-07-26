# Product Requirements Document (PRD)

## Product Name: InvoiceAI

**Document Version:** 1.1
**Status:** Draft for Development

> **Companion document:** Antigravity build setup (rules, skills, workflows) lives separately in `InvoiceAI_Antigravity_Agent_Guide.md` — this PRD stays focused on the product itself.

---

## 1. Product Summary

InvoiceAI is an AI-powered invoicing web application that lets freelancers, small businesses, and independent professionals generate, manage, and export professional invoices using natural language prompts, alongside a traditional manual builder. The AI layer (Gemini API) removes repetitive data entry — client details, service descriptions, tax math, payment terms, and follow-up emails — while a live preview and PDF export keep the output polished and client-ready.

This PRD translates the original Problem Statement into a build-ready specification: user stories, functional/non-functional requirements, data model, API surface, screen-by-screen UX flow, visual design language, and a phased release plan.

---

## 2. Goals & Success Metrics

| Goal | Metric | Target (v1) |
|---|---|---|
| Reduce invoice creation time | Avg. time from "New Invoice" click to PDF download | < 60 seconds (AI mode) |
| Drive AI adoption over manual entry | % of invoices created via AI prompt | > 50% |
| Keep the app usable end-to-end | Successful PDF export rate | > 98% of save attempts |
| Retain users | 7-day return rate (logged-in users) | > 30% |
| Portfolio-quality build | Lighthouse performance/accessibility score | > 90 |

---

## 3. Target Users & Personas

| Persona | Need |
|---|---|
| **Freelance Developer/Designer** | Fast invoices for project milestones, no accounting jargon |
| **Consultant/Agency Owner** | Recurring clients, professional tone, GST/tax handling |
| **Content Creator** | Simple one-off invoices for brand deals |
| **Student (portfolio use)** | A believable, demo-ready SaaS product to showcase full-stack + AI skills |

---

## 4. Scope

### 4.1 In Scope — Version 1 (MVP)
- Firebase Auth: Google Sign-In, Email/Password, Guest Mode
- AI Invoice Generator (natural language → structured invoice) via Gemini API
- Manual Invoice Builder with live preview
- AI Smart Assistant: service description generator, payment terms suggester, notes generator, invoice validator, email draft generator
- Client management (CRUD, search, history)
- Invoice management (CRUD, duplicate, archive, mark as paid, search/filter/sort)
- Business Profile (logo, signature, GST number, default currency)
- PDF export (branded, with optional QR code)
- Dashboard with core analytics (revenue, invoice status breakdown, recent activity)
- Responsive UI (mobile + desktop)
- Firestore cloud storage

### 4.2 Out of Scope — Reserved for Version 2
- Recurring invoices
- OCR invoice scanner
- Voice-based invoice generation
- Multi-language invoice generation
- Payment gateway integration (Razorpay/Stripe)
- Expense tracking
- AI-driven business insights/forecasting

---

## 5. User Stories

### Authentication
- As a new user, I can sign up with Google or email so I don't need to remember a separate password.
- As a first-time visitor, I can try the app in Guest Mode without creating an account, with a clear prompt to save my work by signing up.

### AI Invoice Generation
- As a user, I can type a plain-language description of the work and get a complete, editable invoice draft in seconds.
- As a user, if the AI misunderstands a detail (amount, client name, tax rate), I can edit any field directly in the generated invoice before saving.

### Manual Builder
- As a user, I can add/remove line items dynamically and see the total update live.
- As a user, I can select a currency and have the tax/discount calculations reflect that currency's formatting.

### AI Smart Assistant
- As a user, I can turn a rough one-line service description into a polished, client-ready paragraph.
- As a user, I can get suggested payment terms (Net 15/30, advance, immediate) based on the invoice context.
- As a user, before sending an invoice, I want the system to flag missing/duplicate information so I don't send an incomplete invoice.
- As a user, I can generate a professional email draft to accompany the invoice, ready to copy or send.

### Client & Invoice Management
- As a user, I can search my past clients and auto-fill their details into a new invoice.
- As a user, I can filter invoices by status (paid/pending/overdue) and sort by date or amount.
- As a user, I can duplicate a past invoice to quickly create a similar one.

### Business Profile & Export
- As a user, I can upload my logo and signature once and have them appear automatically on every PDF.
- As a user, I can download a professional PDF invoice that looks consistent regardless of which creation method I used.

### Dashboard
- As a user, I can see at a glance how much revenue I've invoiced, how much is pending, and my most recent activity.

---

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | System shall authenticate users via Firebase (Google OAuth, Email/Password, anonymous Guest session) |
| FR-2 | System shall accept a natural language prompt and return a structured invoice object (client, items, tax, due date, terms, notes) via Gemini API |
| FR-3 | System shall provide a manual form with dynamic line items, tax %, discount, currency selector, and due date picker |
| FR-4 | System shall render a live, real-time invoice preview reflecting either AI-generated or manually entered data |
| FR-5 | System shall provide AI sub-tools: description generator, payment terms suggester, notes generator, validator, email draft generator — each independently callable from the invoice editor |
| FR-6 | System shall validate invoices for missing client info, missing due date, missing tax fields, and duplicate invoice numbers before allowing "Send/Finalize" |
| FR-7 | System shall support full CRUD + duplicate + archive + mark-as-paid on invoices |
| FR-8 | System shall support full CRUD + search on clients, and show a client's invoice history |
| FR-9 | System shall store a single Business Profile per user (name, logo, address, GST number, signature, default currency) |
| FR-10 | System shall generate a downloadable PDF matching the live preview, including logo, signature, and optional QR code |
| FR-11 | System shall persist all data in Firestore, scoped per authenticated user (or per guest session) |
| FR-12 | System shall present a dashboard summarizing total/paid/pending invoices, revenue, and recent activity |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Initial load < 2.5s on 4G; AI response < 5s for typical prompts |
| Responsiveness | Fully usable on screens from 360px (mobile) to 1920px (desktop) |
| Security | Firebase security rules enforce per-user data isolation; no invoice/client data readable across accounts |
| Reliability | PDF export must succeed even if AI service is temporarily unavailable (manual mode always works) |
| Scalability | Firestore schema designed to avoid hot-document writes as invoice volume grows |
| Usability | Core invoice creation flow (AI or manual) completable without documentation/tutorial |
| Portability | Deployable to Vercel (frontend) + Firebase (backend services) with no server maintenance |

---

## 8. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React.js + Vite + Tailwind CSS + React Router + React Hook Form |
| Backend | Node.js + Express.js (thin API layer for Gemini calls & PDF generation) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage (logos, signatures) |
| AI | Google Gemini API |
| PDF | pdf-lib (or jsPDF) |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Deployment | Vercel (frontend) + Firebase (DB/Auth/Storage) |

---

## 9. High-Level Data Model (Firestore)

```
users/{userId}
  ├─ profile: { businessName, logoUrl, address, gstNumber, signatureUrl, defaultCurrency }
  ├─ clients/{clientId}
  │    { name, email, address, phone, gstNumber, createdAt }
  ├─ invoices/{invoiceId}
  │    {
  │      invoiceNumber, clientId, status: [draft|pending|paid|archived],
  │      items: [{ description, qty, rate, amount }],
  │      taxPercent, discount, currency, dueDate, notes, paymentTerms,
  │      createdAt, updatedAt, source: [ai|manual]
  │    }
  └─ activity/{activityId}
       { type, invoiceId, timestamp, description }
```

Guest Mode sessions map to a temporary anonymous Firebase UID; data prompts for migration to a full account on sign-up.

---

## 10. Core Screens / UX Flow

```
Login / Signup / Guest
        │
        ▼
   Dashboard ── (Revenue, Status Breakdown, Recent Activity, Quick Actions)
        │
        ▼
  Create Invoice
   ┌────┴─────┐
   ▼          ▼
AI Prompt   Manual Form
   │          │
   └────┬─────┘
        ▼
 Invoice Editor (shared)
   ├─ AI Smart Assistant tools (description / terms / notes / email / validator)
   └─ Live Preview (side-by-side or toggle on mobile)
        ▼
   Save → Firestore
        ▼
  Generate PDF → Download / Print / Email draft
        ▼
  Invoice List (search / filter / sort / duplicate / archive / mark paid)
        ▼
  Client Detail (history, edit)

Settings → Business Profile (logo, signature, GST, currency)
```

---

## 11. UI/UX Visual Design Language

### 11.1 Reference

Three reference screens were reviewed (a competitor product, "Invoicer.ai") purely for **layout and color language** — not for direct reuse. They show a mature invoicing SaaS pattern worth borrowing structurally:

- A marketing landing page: white background, bold dark headline text, one strong accent-colored CTA button, a light accent-tinted "trust" pill badge, small rating/star rows, generous whitespace, rounded corners throughout.
- An app shell: a **dark (near-black) left sidebar** with icon + label nav items and a clearly highlighted active state, sitting next to a **white main content area**.
- Content patterns: bordered/rounded input fields with light gray placeholder text, section labels in a bold accent color (e.g., "From", "Billed To"), pill-shaped status badges (e.g., "Created"), a segmented tab control for filtering (All/Unsent/Sent/Approved…), a persistent search bar, and a full-width primary CTA button anchoring the bottom of empty states.

InvoiceAI should adopt this **structure** (dark sidebar + white canvas + accent highlights + pill badges + segmented tabs) while using its **own color identity** rather than the reference's green branding.

### 11.2 InvoiceAI Color Palette

| Token | Color | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Main content background |
| `--color-surface` | `#F7F9FC` | Cards, input backgrounds, hover states |
| `--color-sidebar` | `#0F1115` (near-black) | Left navigation sidebar |
| `--color-sidebar-active` | `#1C2027` | Active/hovered sidebar item background |
| `--color-primary` | `#2563EB` (blue) | Primary buttons, links, active tab, focus rings |
| `--color-primary-hover` | `#1D4ED8` | Button/link hover state |
| `--color-accent-tint` | `#EFF4FF` | Light-blue badge backgrounds, info pills |
| `--color-text-primary` | `#0F1115` | Headings, body copy |
| `--color-text-secondary` | `#6B7280` | Placeholder text, helper text, muted labels |
| `--color-border` | `#E5E7EB` | Input borders, dividers |
| `--color-success` | `#16A34A` | "Paid" status, success toasts |
| `--color-warning` | `#D97706` | "Pending"/"Overdue" status |
| `--color-danger` | `#DC2626` | Validation errors, destructive actions |

This gives a clean white-and-blue identity (with black used only for the sidebar and primary text) instead of copying the reference's green branding.

### 11.3 Typography & Iconography
- Font: a single clean sans-serif (e.g., Inter or Poppins) — bold weights for headings/section labels, regular for body/inputs.
- Icons: Lucide React throughout, matching the tech stack in §8 — used at a consistent small size in the sidebar and inline with buttons.
- Status/state communicated with pill-shaped badges (rounded-full, small text, tinted background) rather than color-only text, for accessibility.

### 11.4 Layout Principles
- **App shell:** fixed dark sidebar (Dashboard, Invoices, New Invoice, Clients, Business Profile, AI Assistant) + white main canvas, consistent across all authenticated screens.
- **Forms:** bordered, rounded input fields with light gray placeholder text (never pure black placeholders), grouped into clear labeled sections (e.g., "From" / "Billed To" style two-column layout on desktop, stacking to one column on mobile).
- **Lists (Invoices/Clients):** segmented filter tabs at the top, a full-width search bar beneath, sortable columns, and an empty state with a single full-width primary CTA button — mirroring the reference's "No records available → Create an Estimate" pattern.
- **Invoice Editor + Live Preview:** side-by-side on desktop (editor left, live preview right), collapsible/tabbed on mobile so only one is visible at a time.
- **Buttons:** solid blue for primary actions (Save, Generate, Send), white-with-border for secondary actions (View, PDF, Settings), consistent rounded corners (~8px) across all interactive elements.
- **Whitespace:** generous padding on landing/marketing surfaces; slightly denser but still uncluttered padding inside the app itself, consistent with a "simple, minimalistic, clear" feel rather than a dense accounting-software look.

This section is a **visual reference for the design/frontend work**, not a pixel-for-pixel spec — actual component sizing and spacing should be finalized in the `frontend-design` skill/workflow during implementation.

---

## 12. AI Prompt Contracts (for Gemini integration)

To keep AI output reliable, the backend should request **structured JSON only** from Gemini, e.g.:

```json
{
  "client": { "name": "", "email": "", "address": "" },
  "items": [{ "description": "", "quantity": 1, "rate": 0 }],
  "taxPercent": 0,
  "discount": 0,
  "currency": "INR",
  "dueDate": "YYYY-MM-DD",
  "paymentTerms": "",
  "notes": ""
}
```

The system prompt should explicitly instruct Gemini to return only JSON, infer sensible defaults for unstated fields (e.g., default 15-day due date), and never fabricate a GST/tax number. The Invoice Validator (FR-6) then runs a rules-based pass over this JSON before it reaches the editor, independent of what Gemini returns.

---

## 13. Release Plan

| Phase | Scope | Suggested Duration |
|---|---|---|
| Phase 0 | Project scaffolding, Firebase setup, Auth, empty Dashboard shell | 1 week |
| Phase 1 | Manual Invoice Builder + Live Preview + PDF export | 1–2 weeks |
| Phase 2 | AI Invoice Generator + AI Smart Assistant tools | 1–2 weeks |
| Phase 3 | Client Management + Business Profile | 1 week |
| Phase 4 | Dashboard analytics + polish + responsive QA | 1 week |
| Phase 5 | Deployment, testing, portfolio write-up | few days |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Gemini returns malformed/incomplete JSON | Server-side schema validation + fallback to manual editor with partial data pre-filled |
| Firestore costs scale with reads (dashboard aggregates) | Maintain a denormalized `summary` doc per user updated via Cloud Function/transaction instead of scanning all invoices |
| PDF layout breaks with long descriptions/logos | Fixed-width PDF template with text wrapping and logo size caps, tested with edge-case data |
| Guest mode data loss | Prompt to convert guest → full account before any destructive action (delete, sign-out) |

---

## 15. Expected Outcome

InvoiceAI delivers a fast, AI-assisted invoicing experience that remains fully functional without AI (manual mode as a reliable fallback), backed by a clean Firestore data model, a polished PDF export, and a clear, minimal white/blue visual identity. As a portfolio project, it demonstrates full-stack architecture and AI integration with a defined contract (not just "chat with Gemini"). See the companion `InvoiceAI_Antigravity_Agent_Guide.md` for how this PRD translates into an efficient agent-driven build process.
