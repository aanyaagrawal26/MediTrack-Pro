# 🏥 MediTrack Pro — Hospital Medicine Reminder & Nurse Verification System

> **A closed-loop medication-safety app: a reminder is never dismissed without proof of administration.**

When a medicine is due, the alarm keeps ringing. It only stops when a nurse
explicitly verifies — with her name, the actual time, and optional notes — that
the medicine was really given. Every administration becomes a permanent,
filterable audit record. This is the core idea behind real hospital eMAR
(electronic Medication Administration Record) systems, rebuilt as a clean,
modern demo.

---

## 📛 Project name suggestions

| Name | Vibe |
|------|------|
| **MediTrack Pro** ✅ (used here) | Professional, product-like |
| **DoseGuard** | Safety-focused |
| **SafeDose** | Simple & memorable |
| **MedAlert / MedVerify** | Emphasises the alarm + verification |
| **NurseSync** | Workflow-focused |
| **CareLoop** | "Closed-loop" medication safety |

---

## ✨ Features

1. **Patient Management** — admit / edit / delete patients (name, age, gender, ward, bed, condition, doctor).
2. **Medicine Schedules** — multiple medicines per patient, with dosage, frequency, start/end dates and **multiple daily reminder times**.
3. **Reminder System** — a floating, **audible alarm** that lists every due dose and **never auto-dismisses**. Overdue counters keep climbing until acted on.
4. **Nurse Confirmation** — mandatory verification dialog records nurse, **auto-captured actual time**, notes, and auto-classifies **Given / Delayed**.
5. **Medicine Logs / History** — full audit trail with filters (patient, nurse, medicine, status, date) and **CSV export**. Shows scheduled vs given time.
6. **Dashboard** — today's Overdue / Upcoming / Given / Delayed / Missed counts + a **patient-wise status table**.
7. **Authentication & Roles** — Admin, Doctor, Head Nurse and Nurse, each with scoped permissions.
8. **Polished UI** — clinical design, responsive layout, cards, tables, colour-coded status badges, live "monitoring active" indicator.

### 🚀 Advanced features (v2 — hospital-grade upgrade)

9. **Patient photos & avatars** — upload a photo (stored as base64) or fall back to gradient initials.
10. **Medicine icons** — every drug gets a deterministic colour + pill/syringe/drop icon.
11. **Patient QR wristbands** — printable QR ID band encoding patient identifiers (`qrcode.react`).
12. **Barcode medicine verification (BCMA)** — the nurse must *scan the medicine barcode* before a dose can be confirmed (right-drug safety check).
13. **Nurse shift management** — Morning / Evening / Night roster per ward and date.
14. **Emergency alert button** — broadcast Code Blue / Red / Pink / Rapid Response hospital-wide, with a pulsing banner + voice announcement.
15. **Pharmacy inventory** — stock levels, low-stock alerts, and auto-decrement when a dose is given.
16. **Bed occupancy tracker** — live ward-by-ward bed grid with utilisation %.
17. **Doctor prescription page** — create prescriptions and *activate* them into live medicine schedules.
18. **Analytics dashboard** — Recharts: 7-day adherence trend, status pie, doses-per-ward, per-nurse verifications.
19. **PDF report export** — branded, colour-coded medicine-log PDF (`jsPDF` + autotable).
20. **Dark mode** — full light/dark theme with animated toggle, persisted + OS-aware.
21. **Voice alarm** — spoken announcements of overdue medicines (Web Speech API).
22. **Escalation system** — 15 min → nurse, 30 min → head nurse, 60 min → doctor, surfaced in the alerts centre.
23. **Premium UI** — gradient hero with hospital illustration, Framer Motion animations, sectioned sidebar, SaaS-grade polish.

### Demo accounts

| Role | Username | Password | Scope |
|------|----------|----------|-------|
| **Admin** | `admin` | `admin123` | Everything (Dr. Anita Rao) |
| **Doctor** | `doctor` | `doctor123` | Prescribes; sees all wards (Dr. Samuel Menon) |
| **Head Nurse** | `head` | `head123` | Ward oversight; gets L2 escalations (Priya Sharma) |
| **Nurse** | `amelia` | `nurse123` | General Ward A |
| **Nurse** | `raj` | `nurse123` | ICU |

> One-click "Quick demo login" buttons are on the sign-in page.

---

## 🧰 Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** (with `darkMode: "class"`) for styling
- **Framer Motion** — animations & transitions
- **Recharts** — analytics charts
- **qrcode.react** — patient QR wristbands
- **jsPDF + jspdf-autotable** — PDF report export
- **lucide-react** icons
- **Web Audio API / Web Speech API** — alarm chime & voice announcements (no audio files)
- **Prisma + PostgreSQL** — schema included and ready (`prisma/schema.prisma`)
- **localStorage data layer** (default) — so the project runs with **zero database setup**

### Why localStorage first?

The entire data layer lives in **one file** (`src/lib/store.ts`). The UI never
talks to storage directly — it only calls functions like `getPatients()` or
`confirmDose()`. To move to a real PostgreSQL database you reimplement just that
one file against Prisma; the rest of the app is untouched because the function
signatures and the `types.ts` shapes already match the Prisma models exactly.

---

## 🚀 Setup — run it in 3 commands

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open the app
#    http://localhost:3000
```

That's it. Demo data (patients, nurses, medicines) is seeded automatically on
first load. Use a **Quick demo login** button to jump in.

> 💡 **Tip:** The alarm chime needs one click anywhere on the page first
> (browsers block audio until a user interacts). Use the 🔊 button on the
> reminder panel to mute/unmute.

### Useful scripts

```bash
npm run build      # production build (type-checks everything)
npm run start      # run the production build
npm run lint       # eslint
```

---

## 🗄️ Optional: switch to a real PostgreSQL database

The localStorage version is perfect for a demo. When you want a real DB:

```bash
# 1. Make sure PostgreSQL is running, then:
cp .env.example .env
#    edit DATABASE_URL in .env

# 2. Generate the client and create tables
npm run prisma:generate
npm run prisma:migrate     # creates the schema in your DB

# 3. (Optional) open a visual DB browser
npm run prisma:studio
```

Then create `src/lib/db.ts` (a Prisma client singleton) and reimplement the
functions in `src/lib/store.ts` using Prisma queries — e.g. `getPatients()`
becomes `prisma.patient.findMany()`. Because the return types already match,
no component code changes.

---

## 📁 Folder structure

```
meditrack-pro/
├── prisma/
│   └── schema.prisma          # PostgreSQL schema (User, Patient, Medicine, Dose)
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout + ThemeProvider + AuthProvider
│   │   ├── globals.css         # Tailwind + component classes + dark mode + barcode
│   │   ├── page.tsx            # Login / landing page
│   │   ├── dashboard/page.tsx  # Hero + metrics + patient-wise status
│   │   ├── reminders/page.tsx  # Today's dose timeline + filters
│   │   ├── analytics/page.tsx  # Recharts analytics dashboard
│   │   ├── patients/page.tsx   # Patient cards, avatars, QR
│   │   ├── prescriptions/page.tsx # Doctor prescriptions → schedules
│   │   ├── medicines/page.tsx  # All medicine schedules (manage)
│   │   ├── inventory/page.tsx  # Pharmacy stock + low-stock alerts (manage)
│   │   ├── beds/page.tsx       # Bed occupancy tracker
│   │   ├── shifts/page.tsx     # Nurse shift roster
│   │   ├── logs/page.tsx       # Audit history + CSV & PDF export
│   │   └── nurses/page.tsx     # Staff accounts (admin)
│   ├── components/
│   │   ├── AppShell.tsx        # Sectioned sidebar, top bar, auth guard
│   │   ├── ReminderEngine.tsx  # Always-on alarm 🔔 (chime + voice + escalation)
│   │   ├── ConfirmDoseModal.tsx# Nurse verification + barcode scan ✅
│   │   ├── AlertsCenter.tsx    # Escalation/emergency notification centre
│   │   ├── EmergencyButton.tsx # Panic button → code broadcast
│   │   ├── EmergencyBanner.tsx # Hospital-wide emergency banner
│   │   ├── DashboardHero.tsx   # Gradient hero + SVG hospital illustration
│   │   ├── PatientQRModal.tsx  # Printable QR wristband
│   │   ├── Barcode.tsx         # Faux-barcode renderer + medicine code
│   │   ├── Avatar.tsx          # Photo / gradient-initials avatar
│   │   ├── MedicineIcon.tsx    # Per-drug coloured icon
│   │   ├── ThemeToggle.tsx     # Animated dark-mode switch
│   │   ├── motion.tsx          # Framer Motion helpers (Reveal/HoverCard)
│   │   ├── PatientFormModal.tsx / MedicineFormModal.tsx / NurseFormModal.tsx
│   │   ├── Modal.tsx · StatCard.tsx · StatusBadge.tsx
│   └── lib/
│       ├── types.ts            # Domain types (mirror Prisma models)
│       ├── store.ts            # 🔑 THE data layer (localStorage CRUD + pub/sub)
│       ├── reminders.ts        # 🧠 Reminder + escalation engine
│       ├── constants.ts        # Wards, beds, shifts, escalation steps, codes
│       ├── medicineIcons.ts    # Medicine → icon/colour mapping
│       ├── seed.ts             # Demo data (users, patients, meds, stock, rx, shifts)
│       ├── auth.tsx            # Auth context (roles: admin/doctor/head nurse/nurse)
│       ├── theme.tsx           # Dark-mode context
│       ├── voice.ts            # Web Speech API voice alarm
│       ├── useStore.ts         # Hook: re-render on data change + on a timer
│       └── utils.ts            # Date/format helpers
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🧠 How the reminder logic works (the important part)

This is the heart of the app and the best thing to explain in a viva.

### 1. Schedules describe *intent*, Doses are *concrete events*

A `Medicine` says *"Metformin 500mg, twice daily at 08:00 and 20:00, from Jun 13 → Jun 25"*.
That's a plan, not an event. The **reminder engine** (`src/lib/reminders.ts`)
turns plans into concrete **`Dose`** rows — one per medicine, per time, per day:

```
Metformin @ 2026-06-15 08:00  → Dose #1 (PENDING)
Metformin @ 2026-06-15 20:00  → Dose #2 (PENDING)
```

`generateDoses()` runs on a timer and is **idempotent** — a unique
`medicineId + scheduledAt` key means it never creates duplicates.

### 2. A dose has a strict lifecycle

```
                ┌────────── nurse confirms (on time) ──────────►  GIVEN
   PENDING ─────┤
   (the alarm)  ├────────── nurse confirms (late > 15 min) ────►  DELAYED
                │
                └────────── nurse marks "could not give" ──────►  MISSED
```

- A dose stays **PENDING** until a nurse acts. **Nothing auto-dismisses it.**
- When `scheduledAt` has passed but it's still PENDING, the UI shows it as
  **OVERDUE** (red, pulsing) and the alarm rings.
- On confirmation, `confirmDose()` **auto-captures the current time** as
  `givenAt`, and compares it to `scheduledAt`:
  - within the 15-minute grace window → **GIVEN** (on time)
  - later than that → **DELAYED**

### 3. The alarm that won't quit

`ReminderEngine.tsx` is mounted once in the app shell, so it runs on **every**
page. Every 15 seconds it:

1. calls `generateDoses()` to materialise any newly-due doses,
2. recomputes `getActiveReminders()` = *PENDING doses whose time has passed*,
3. if any exist and not muted, plays a two-tone **Web Audio chime** (no audio
   file needed) — and repeats it on the next cycle.

Because the chime is re-triggered while reminders remain, and a dose can only
leave PENDING through the verification dialog, **the only way to silence the
alarm is to actually verify the medicine.** That is the patient-safety
guarantee.

### 4. Escalation ladder (`runEscalation()` in `reminders.ts`)

Each tick also walks every overdue dose and raises an **Alert** for every
threshold it has crossed — idempotently (one alert per dose per level):

| Overdue | Level | Who is alerted |
|---------|-------|----------------|
| ≥ 15 min | L1 | the **nurse** |
| ≥ 30 min | L2 | the **head nurse** |
| ≥ 60 min | L3 | the **doctor** |

Alerts appear in the top-bar **Alerts Centre** and as coloured chips on the
alarm panel. When the dose is finally verified (or marked missed),
`resolveAlertsForDose()` auto-acknowledges its open escalations.

### 5. Barcode verification (BCMA)

Before `confirmDose()` can run, the nurse must **scan the medicine barcode**
(type the code or hit *Simulate scan*). The code must match the expected
medicine — a software enforcement of the "right drug" safety check used by real
bar-code medication administration systems. Confirming also **decrements
pharmacy stock** for that medicine.

### 6. Live updates without a backend

A tiny pub/sub in `store.ts` (`subscribe`/`emit`) notifies all components when
data changes. The `useStore()` hook re-runs its selector on every change **and**
on a timer — so overdue counters, "due now" labels and dashboards stay live, and
two browser tabs stay in sync via the `storage` event.

---

## 🧬 Database schema

Four tables (see `prisma/schema.prisma`):

- **User** — admins & nurses. `role` (`ADMIN`/`NURSE`), `ward` (nurses scoped to a ward).
- **Patient** — demographics + ward/bed + condition + doctor.
- **Medicine** — a schedule belonging to a patient: dosage, frequency, `times[]`, start/end dates.
- **Dose** — one expected administration: `scheduledAt`, `givenAt`, `status`, the confirming `nurse`, notes.

### ER diagram (text explanation)

```
┌──────────┐         ┌───────────┐         ┌──────────┐
│  User    │         │  Patient  │ 1     N │ Medicine │
│  (Nurse/ │         │           │─────────│          │
│   Admin) │         └─────┬─────┘         └────┬─────┘
└────┬─────┘               │ 1                  │ 1
     │ 1                   │                    │
     │                     │ N                  │ N
     │ confirms     ┌──────┴────────────────────┴──────┐
     │      N       │              Dose                 │
     └──────────────│  scheduledAt / givenAt / status   │
                    └───────────────────────────────────┘
```

**Relationships in words:**

- **Patient → Medicine** is **one-to-many**: one patient can have many medicines.
  (Delete a patient → their medicines cascade-delete.)
- **Medicine → Dose** is **one-to-many**: one medicine generates many dose events
  (one per scheduled time per day).
- **Patient → Dose** is **one-to-many** (kept directly on the Dose for fast,
  patient-scoped queries on the dashboard).
- **User (Nurse) → Dose** is **one-to-many**: a nurse confirms many doses; each
  dose records the **one** nurse who verified it (`nurseId`). This is the
  accountability link — every administration is tied to a named nurse.

The `Dose` table is effectively the **MAR (Medication Administration Record)** —
the legal audit trail of who gave what, to whom, and exactly when.

---

## 🌱 Sample demo data — a full, busy hospital

Generated **procedurally with a deterministic seeded RNG** in `src/lib/seed.ts`
(so the same data appears on every reload), and resettable any time via the
**"Reset demo data"** button in the sidebar. Out of the box you get:

| Entity | Count |
|--------|-------|
| Patients | **50** (Indian names, photos, blood groups, allergies) |
| Staff | **44** — 1 admin · **10 doctors** · **8 head nurses** · **25 nurses** |
| Wards / beds | **8 wards** · **120 beds** |
| Pharmacy drugs | **80** (form, route, stock, reorder levels) |
| Medicine schedules | **150** (~3 per patient) |
| Dose records (logs) | **440+** with a realistic Given / Delayed / Missed / Pending mix |
| Active prescriptions | **40** |
| Shift roster records | **30** |
| Escalation / emergency alerts | **20** |

Patients are spread across all 8 wards into unique beds; nurses are rostered to
wards + shifts; doctors are assigned by specialty; diseases span diabetes,
dengue, cardiac care, ICU sepsis, post-surgery, asthma, pneumonia and more.
Today's doses are timed so **some are already overdue** (alarm + escalations
fire immediately) while others are upcoming — so the dashboard, analytics,
inventory, beds, logs and reminders screens all look live on first load.

> Performance note: with hundreds of doses, the dose-enrichment in
> `reminders.ts` builds id→object maps once per pass (not a lookup per dose),
> and the logs table caps its rendered rows (export still uses the full set).

---

## 🔭 Future scope

- **Real database** — swap the localStorage layer for the included Prisma/Postgres schema.
- **Secure auth** — NextAuth + hashed passwords (bcrypt/argon2) + JWT sessions.
- **Push / SMS / WhatsApp alerts** to on-duty nurses for overdue doses.
- **Auto-escalation** — if a dose stays overdue past N minutes, notify the ward in-charge.
- **Barcode / QR scanning** — scan patient wristband + medicine to enforce the "5 rights".
- **Doctor portal** — prescribe medicines directly; e-prescription integration.
- **Drug interaction & allergy checks** before a schedule is created.
- **Analytics dashboard** — adherence trends, delay heatmaps, per-nurse stats.
- **Multi-language & accessibility** (screen-reader, high-contrast) for real wards.
- **Offline-first PWA** so the ward tablet keeps working if Wi-Fi drops.
- **Audit immutability** — append-only log with timestamps for compliance (HIPAA-style).

---

## 🎤 Presentation / viva points

Short, high-impact things to say during a demo:

1. **The problem:** in real hospitals, a dismissed reminder ≠ a given medicine.
   Missed/late doses harm patients. We close that loop.
2. **The one-line pitch:** *"No reminder is dismissed without proof of administration."*
3. **Show the alarm:** log in as a nurse → the floating panel is already ringing
   with overdue doses → it won't stop until you **Verify**.
4. **Show verification:** the dialog auto-records the **actual time** and the
   **nurse's name** → confirming on time = **Given**, late = **Delayed**.
5. **Show the audit trail:** Logs page → filter by nurse/patient/status/date →
   scheduled vs given time → **export CSV**.
6. **Show roles:** admin manages patients/medicines/nurses; nurse only sees her
   **own ward** and can only verify (least-privilege / security).
7. **Explain the architecture:** schedules → generated dose events → strict
   PENDING→GIVEN/DELAYED/MISSED lifecycle. Mention the **idempotent dose
   generator** and the **pub/sub live updates**.
8. **Explain extensibility:** all persistence is in ONE file → swap localStorage
   for the included **Prisma + PostgreSQL** schema with no UI changes.
9. **Talk patient safety:** grace window, overdue escalation, accountability per
   nurse — these mirror real eMAR systems.
10. **Tech credibility:** Next.js 14 App Router, TypeScript end-to-end, Tailwind,
    fully responsive, production build passes type-checking.

---

## 🔒 A note on dependencies / security

`npm audit` may flag advisories in Next.js. They affect **server-side**
features (Image Optimization, middleware/i18n, WebSocket upgrades) that this
**client-only demo does not use** — the only full fix is a breaking upgrade to
Next 16. For a college/demo project this is safe to leave; for production,
upgrade to the latest Next.js major and hash all passwords.

---

## 📜 License

MIT — free to use for your college project, demos, and learning. Built as an
educational patient-safety reference app.
