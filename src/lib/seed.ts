// =============================================================================
// Demo seed data — "large hospital" edition
// -----------------------------------------------------------------------------
// Procedurally generates a realistic, busy hospital so every screen looks full:
//   • 50 patients across 8 wards / 120 beds, with Indian names + photos
//   • 44 staff: 1 admin, 10 doctors, 8 head nurses, 25 nurses (shift-rostered)
//   • 80 pharmacy drugs (with form / route / stock)
//   • 150 medicine schedules  ·  ~300 dose records (mixed statuses)
//   • 40 active prescriptions  ·  30 shift records  ·  20 alert records
//
// A seeded RNG (mulberry32) makes the data DETERMINISTIC: the same patients land
// in the same beds on every reload, so the demo is stable and reproducible.
// The original demo accounts (admin / doctor / head / amelia / raj) are kept.
// =============================================================================

import type {
  Alert,
  Dose,
  DoseStatus,
  InventoryItem,
  Medicine,
  Patient,
  Prescription,
  Role,
  ShiftAssignment,
  Shift,
  User,
} from "./types";
import { WARDS, bedLabels, SHIFTS, EMERGENCY_CODES } from "./constants";
import { toDateKey } from "./utils";

// ----- Deterministic RNG + helpers -------------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20240615);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));
const chance = (p: number) => rand() < p;

const today = new Date();
const todayKey = toDateKey(today);

/** A Date at `daysAgo` days ago, at local time "HH:mm". */
function at(daysAgo: number, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo, h, m, 0, 0);
}

// ----- Name pools (Indian) ---------------------------------------------------

const MALE = [
  "Aarav", "Vivaan", "Aditya", "Arjun", "Reyansh", "Krishna", "Ishaan", "Rohan", "Karan", "Rahul",
  "Amit", "Vikram", "Suresh", "Ramesh", "Mahesh", "Rajesh", "Anil", "Sunil", "Deepak", "Manoj",
  "Sanjay", "Ravi", "Kiran", "Naveen", "Pradeep", "Ajay", "Vijay", "Harish", "Prakash", "Arun",
  "Nikhil", "Varun", "Siddharth", "Akash", "Yash", "Dev", "Kabir", "Gopal", "Imran", "Farhan",
];
const FEMALE = [
  "Aanya", "Diya", "Saanvi", "Aadhya", "Ananya", "Anika", "Navya", "Priya", "Pooja", "Neha",
  "Kavya", "Sneha", "Divya", "Meera", "Anjali", "Shreya", "Riya", "Isha", "Nisha", "Swati",
  "Rekha", "Sunita", "Geeta", "Lata", "Asha", "Usha", "Radha", "Komal", "Deepa", "Sonia",
  "Sarita", "Vandana", "Jyoti", "Pallavi", "Sakshi", "Fatima", "Ayesha", "Zoya", "Naina", "Tara",
];
const LAST = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Nair", "Iyer", "Menon",
  "Rao", "Naidu", "Pillai", "Choudhary", "Mishra", "Pandey", "Joshi", "Desai", "Mehta", "Shah",
  "Bose", "Banerjee", "Mukherjee", "Das", "Ghosh", "Kapoor", "Khanna", "Malhotra", "Bhat", "Shetty",
  "Kulkarni", "Deshmukh", "Patil", "Jain", "Agarwal", "Sinha", "Yadav", "Thakur", "Trivedi", "Sheikh",
];

const BLOOD = ["O+", "O+", "A+", "B+", "O-", "A-", "B-", "AB+", "AB-"];
const ALLERGIES = [
  "None known", "None known", "None known", "Penicillin", "Sulfa drugs", "Aspirin",
  "Iodine contrast", "Peanuts", "Latex",
];

// ----- Diseases per ward -----------------------------------------------------

const DISEASES: Record<string, string[]> = {
  "General Ward A": [
    "Type 2 Diabetes Mellitus", "Hypertension", "Viral fever", "Bacterial pneumonia",
    "Urinary tract infection", "Anemia", "Hypothyroidism", "Acute gastroenteritis",
  ],
  "General Ward B": [
    "Dengue fever", "COPD exacerbation", "Cellulitis", "Hepatitis", "Tuberculosis",
    "Hypertension", "Type 2 Diabetes Mellitus", "Acute kidney injury",
  ],
  ICU: [
    "Septic shock", "Acute respiratory failure", "Multi-organ dysfunction",
    "Post-cardiac arrest care", "Severe COVID-19 pneumonia", "Diabetic ketoacidosis",
  ],
  "Cardiac Care (CCU)": [
    "Acute myocardial infarction", "Congestive heart failure", "Unstable angina",
    "Atrial fibrillation", "Hypertensive crisis", "Post-angioplasty care",
  ],
  Pediatrics: [
    "Acute bronchiolitis", "Pediatric dengue", "Febrile seizure",
    "Gastroenteritis (pediatric)", "Asthma exacerbation", "Pneumonia (pediatric)",
  ],
  Maternity: [
    "Post-cesarean recovery", "Normal delivery — observation", "Pre-eclampsia",
    "Gestational diabetes", "Postpartum care",
  ],
  Emergency: [
    "Road traffic accident — trauma", "Acute appendicitis", "Snake bite",
    "Acute asthma attack", "Poisoning — observation", "Acute chest pain",
  ],
  Orthopedics: [
    "Post-operative knee replacement", "Femur fracture — post-op", "Spinal fusion recovery",
    "Hip fracture", "ACL reconstruction recovery", "Shoulder dislocation",
  ],
};

// ----- Drug catalog (80) — name, form, route, unit, dosage -------------------

type Drug = { name: string; form: string; route: string; unit: string; dose: string };
const DRUGS: Drug[] = (
  [
    ["Metformin", "Tablet", "Oral", "tablets", "500 mg"],
    ["Amlodipine", "Tablet", "Oral", "tablets", "5 mg"],
    ["Paracetamol", "Tablet", "Oral", "tablets", "650 mg"],
    ["Atorvastatin", "Tablet", "Oral", "tablets", "10 mg"],
    ["Aspirin", "Tablet", "Oral", "tablets", "75 mg"],
    ["Losartan", "Tablet", "Oral", "tablets", "50 mg"],
    ["Telmisartan", "Tablet", "Oral", "tablets", "40 mg"],
    ["Omeprazole", "Capsule", "Oral", "capsules", "20 mg"],
    ["Pantoprazole", "Tablet", "Oral", "tablets", "40 mg"],
    ["Amoxicillin", "Capsule", "Oral", "capsules", "500 mg"],
    ["Azithromycin", "Tablet", "Oral", "tablets", "500 mg"],
    ["Cefixime", "Tablet", "Oral", "tablets", "200 mg"],
    ["Levofloxacin", "Tablet", "Oral", "tablets", "500 mg"],
    ["Ciprofloxacin", "Tablet", "Oral", "tablets", "500 mg"],
    ["Doxycycline", "Capsule", "Oral", "capsules", "100 mg"],
    ["Metronidazole", "Tablet", "Oral", "tablets", "400 mg"],
    ["Ibuprofen", "Tablet", "Oral", "tablets", "400 mg"],
    ["Diclofenac", "Tablet", "Oral", "tablets", "50 mg"],
    ["Prednisolone", "Tablet", "Oral", "tablets", "10 mg"],
    ["Montelukast", "Tablet", "Oral", "tablets", "10 mg"],
    ["Cetirizine", "Tablet", "Oral", "tablets", "10 mg"],
    ["Levocetirizine", "Tablet", "Oral", "tablets", "5 mg"],
    ["Ranitidine", "Tablet", "Oral", "tablets", "150 mg"],
    ["Domperidone", "Tablet", "Oral", "tablets", "10 mg"],
    ["Ondansetron", "Tablet", "Oral", "tablets", "4 mg"],
    ["Glimepiride", "Tablet", "Oral", "tablets", "2 mg"],
    ["Gliclazide", "Tablet", "Oral", "tablets", "80 mg"],
    ["Sitagliptin", "Tablet", "Oral", "tablets", "100 mg"],
    ["Clopidogrel", "Tablet", "Oral", "tablets", "75 mg"],
    ["Rosuvastatin", "Tablet", "Oral", "tablets", "10 mg"],
    ["Metoprolol", "Tablet", "Oral", "tablets", "50 mg"],
    ["Spironolactone", "Tablet", "Oral", "tablets", "25 mg"],
    ["Hydrochlorothiazide", "Tablet", "Oral", "tablets", "25 mg"],
    ["Warfarin", "Tablet", "Oral", "tablets", "5 mg"],
    ["Levothyroxine", "Tablet", "Oral", "tablets", "50 mcg"],
    ["Folic Acid", "Tablet", "Oral", "tablets", "5 mg"],
    ["Vitamin D3", "Sachet", "Oral", "sachets", "60000 IU"],
    ["Calcium Carbonate", "Tablet", "Oral", "tablets", "500 mg"],
    ["Ferrous Sulfate", "Tablet", "Oral", "tablets", "200 mg"],
    ["Pregabalin", "Capsule", "Oral", "capsules", "75 mg"],
    ["Gabapentin", "Capsule", "Oral", "capsules", "300 mg"],
    ["Amitriptyline", "Tablet", "Oral", "tablets", "10 mg"],
    ["Sertraline", "Tablet", "Oral", "tablets", "50 mg"],
    ["Escitalopram", "Tablet", "Oral", "tablets", "10 mg"],
    ["Alprazolam", "Tablet", "Oral", "tablets", "0.5 mg"],
    ["Phenytoin", "Capsule", "Oral", "capsules", "100 mg"],
    ["Valproate", "Tablet", "Oral", "tablets", "500 mg"],
    ["Carbamazepine", "Tablet", "Oral", "tablets", "200 mg"],
    ["Allopurinol", "Tablet", "Oral", "tablets", "100 mg"],
    ["Tamsulosin", "Capsule", "Oral", "capsules", "0.4 mg"],
    ["Paracetamol Syrup", "Syrup", "Oral", "ml", "250 mg/5ml"],
    ["Cough Syrup", "Syrup", "Oral", "ml", "10 ml"],
    ["Lactulose Syrup", "Syrup", "Oral", "ml", "15 ml"],
    ["ORS Solution", "Sachet", "Oral", "sachets", "1 sachet"],
    ["Amoxicillin Syrup", "Syrup", "Oral", "ml", "125 mg/5ml"],
    ["Cetirizine Syrup", "Syrup", "Oral", "ml", "5 mg/5ml"],
    ["Zinc Syrup", "Syrup", "Oral", "ml", "20 mg"],
    ["Multivitamin Syrup", "Syrup", "Oral", "ml", "5 ml"],
    ["Domperidone Syrup", "Syrup", "Oral", "ml", "5 ml"],
    ["Salbutamol Syrup", "Syrup", "Oral", "ml", "2 mg/5ml"],
    ["Insulin (Human)", "Injection", "Subcutaneous", "vials", "10 IU"],
    ["Ceftriaxone", "Injection", "IV", "vials", "1 g"],
    ["Piperacillin-Tazobactam", "Injection", "IV", "vials", "4.5 g"],
    ["Meropenem", "Injection", "IV", "vials", "1 g"],
    ["Vancomycin", "Injection", "IV", "vials", "1 g"],
    ["Heparin", "Injection", "Subcutaneous", "vials", "5000 IU"],
    ["Enoxaparin", "Injection", "Subcutaneous", "syringes", "40 mg"],
    ["Dexamethasone", "Injection", "IV", "vials", "4 mg"],
    ["Hydrocortisone", "Injection", "IV", "vials", "100 mg"],
    ["Tramadol", "Injection", "IM", "ampoules", "50 mg"],
    ["Furosemide (Inj)", "Injection", "IV", "ampoules", "20 mg"],
    ["Adrenaline", "Injection", "IV", "ampoules", "1 mg"],
    ["Atropine", "Injection", "IV", "ampoules", "0.6 mg"],
    ["Morphine", "Injection", "IV", "ampoules", "10 mg"],
    ["Pantoprazole (Inj)", "Injection", "IV", "vials", "40 mg"],
    ["Ondansetron (Inj)", "Injection", "IV", "ampoules", "4 mg"],
    ["Salbutamol Inhaler", "Inhaler", "Inhalation", "puffs", "100 mcg"],
    ["Budesonide Inhaler", "Inhaler", "Inhalation", "puffs", "200 mcg"],
    ["Ipratropium Inhaler", "Inhaler", "Inhalation", "puffs", "20 mcg"],
    ["Moxifloxacin Eye Drops", "Drops", "Ophthalmic", "ml", "1 drop"],
  ] as const
).map(([name, form, route, unit, dose]) => ({ name, form, route, unit, dose }));

// ----- Frequency → reminder times --------------------------------------------

const FREQ_TIMES: Record<string, string[]> = {
  "Once daily": ["08:00"],
  "Twice daily": ["08:00", "20:00"],
  "Three times daily": ["08:00", "14:00", "20:00"],
  "Every 8 hours": ["06:00", "14:00", "22:00"],
  "At bedtime": ["22:00"],
  "Before breakfast": ["07:00"],
};
const FREQS = Object.keys(FREQ_TIMES);

// =============================================================================
// 1) USERS — keep originals, then generate the rest
// =============================================================================

export const seedUsers: User[] = [
  { id: "user_admin", name: "Dr. Anita Rao", username: "admin", password: "admin123", role: "ADMIN", ward: null, phone: "+91 98100 00001", createdAt: today.toISOString() },
  { id: "user_doctor", name: "Dr. Samuel Menon", username: "doctor", password: "doctor123", role: "DOCTOR", ward: null, phone: "+91 98100 00002", createdAt: today.toISOString() },
  { id: "user_head_nurse", name: "Priya Sharma", username: "head", password: "head123", role: "HEAD_NURSE", ward: "General Ward A", phone: "+91 98100 00003", createdAt: today.toISOString() },
  { id: "user_nurse_amelia", name: "Amelia Carter", username: "amelia", password: "nurse123", role: "NURSE", ward: "General Ward A", shift: "MORNING", phone: "+91 98100 00004", createdAt: today.toISOString() },
  { id: "user_nurse_raj", name: "Raj Verma", username: "raj", password: "nurse123", role: "NURSE", ward: "ICU", shift: "EVENING", phone: "+91 98100 00005", createdAt: today.toISOString() },
];

const usedUsernames = new Set(seedUsers.map((u) => u.username));
function uniqueUsername(base: string): string {
  const u = base.toLowerCase().replace(/[^a-z]/g, "") || "user";
  if (!usedUsernames.has(u)) {
    usedUsernames.add(u);
    return u;
  }
  // Append the smallest suffix that is free (terminates — never re-checks `u`).
  let n = 2;
  while (usedUsernames.has(`${u}${n}`)) n++;
  const final = `${u}${n}`;
  usedUsernames.add(final);
  return final;
}
function phone(): string {
  return `+91 ${randInt(70, 99)}${randInt(100, 999)} ${randInt(10000, 99999)}`;
}

// --- 9 more doctors (10 total incl. Dr. Samuel Menon) ---
const DOCTOR_DEFS: [string, string][] = [
  ["Anand Krishnan", "Cardiology"],
  ["Sunita Deshpande", "Endocrinology"],
  ["Rajiv Malhotra", "Pulmonology"],
  ["Kavita Iyer", "Pediatrics"],
  ["Arvind Menon", "General Medicine"],
  ["Neelam Joshi", "Obstetrics & Gynaecology"],
  ["Pranav Reddy", "Orthopedics"],
  ["Shalini Nair", "Infectious Diseases"],
  ["Vikram Sinha", "Critical Care"],
];
DOCTOR_DEFS.forEach(([name], i) => {
  seedUsers.push({
    id: `user_doc_${i}`,
    name: `Dr. ${name}`,
    username: uniqueUsername(`dr${name.split(" ")[0]}`),
    password: "doctor123",
    role: "DOCTOR",
    ward: null,
    phone: phone(),
    createdAt: today.toISOString(),
  });
});

// Map a ward to the display name of its lead doctor.
const WARD_DOCTOR: Record<string, string> = {
  ICU: "Dr. Vikram Sinha",
  "Cardiac Care (CCU)": "Dr. Anand Krishnan",
  Pediatrics: "Dr. Kavita Iyer",
  Maternity: "Dr. Neelam Joshi",
  Orthopedics: "Dr. Pranav Reddy",
  Emergency: "Dr. Arvind Menon",
  "General Ward A": "Dr. Sunita Deshpande",
  "General Ward B": "Dr. Shalini Nair",
};

// --- 7 more head nurses (8 total, one per ward incl. Priya Sharma/GWA) ---
WARDS.filter((w) => w.name !== "General Ward A").forEach((w, i) => {
  const female = pick(FEMALE);
  const last = pick(LAST);
  seedUsers.push({
    id: `user_head_${i}`,
    name: `${female} ${last}`,
    username: uniqueUsername(`head${female}`),
    password: "head123",
    role: "HEAD_NURSE",
    ward: w.name,
    phone: phone(),
    createdAt: today.toISOString(),
  });
});

// --- 23 more nurses (25 total incl. Amelia + Raj) ---
const shiftKeys: Shift[] = SHIFTS.map((s) => s.key);
for (let i = 0; i < 23; i++) {
  const isF = chance(0.75);
  const first = isF ? pick(FEMALE) : pick(MALE);
  const last = pick(LAST);
  const ward = WARDS[i % WARDS.length].name;
  seedUsers.push({
    id: `user_nurse_${i}`,
    name: `${first} ${last}`,
    username: uniqueUsername(first),
    password: "nurse123",
    role: "NURSE",
    ward,
    shift: shiftKeys[i % shiftKeys.length],
    phone: phone(),
    createdAt: today.toISOString(),
  });
}

const NURSES = seedUsers.filter((u) => u.role === "NURSE");
const DOCTOR_NAMES = seedUsers.filter((u) => u.role === "DOCTOR").map((u) => u.name);
/** Nurse ids working in a given ward (for assigning who gave a dose). */
function nursesInWard(ward: string): string[] {
  const ids = NURSES.filter((n) => n.ward === ward).map((n) => n.id);
  return ids.length ? ids : NURSES.map((n) => n.id);
}

// =============================================================================
// 2) PATIENTS — 50, assigned to wards + unique beds
// =============================================================================

export const seedPatients: Patient[] = [];
const freeBeds = new Map<string, string[]>(); // ward -> remaining bed labels
WARDS.forEach((w) => freeBeds.set(w.name, bedLabels(w).slice()));

for (let i = 0; i < 50; i++) {
  // Choose a ward that still has a free bed.
  let ward = pick(WARDS).name;
  if ((freeBeds.get(ward)?.length ?? 0) === 0) {
    ward = WARDS.map((w) => w.name).find((w) => (freeBeds.get(w)?.length ?? 0) > 0) ?? ward;
  }
  const beds = freeBeds.get(ward)!;
  const bedNumber = beds.splice(randInt(0, beds.length - 1), 1)[0];

  // Ward-appropriate demographics.
  const isMaternity = ward === "Maternity";
  const isPeds = ward === "Pediatrics";
  const gender = isMaternity ? "FEMALE" : pick(["MALE", "FEMALE"] as const);
  const first = gender === "FEMALE" ? pick(FEMALE) : pick(MALE);
  const name = `${first} ${pick(LAST)}`;
  const age = isPeds ? randInt(1, 14) : isMaternity ? randInt(20, 40) : randInt(18, 92);

  const doctor = chance(0.8) ? WARD_DOCTOR[ward] ?? pick(DOCTOR_NAMES) : pick(DOCTOR_NAMES);

  seedPatients.push({
    id: `pat_${i}`,
    name,
    age,
    gender,
    ward,
    bedNumber,
    condition: pick(DISEASES[ward] ?? DISEASES["General Ward A"]),
    doctor,
    // ~70% get a generated avatar URL (DiceBear); the rest use initials.
    // Avatar.tsx falls back to initials if the URL can't load (offline-safe).
    photoUrl: chance(0.7)
      ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name + i)}`
      : null,
    bloodGroup: pick(BLOOD),
    allergies: pick(ALLERGIES),
    createdAt: today.toISOString(),
  });
}

// =============================================================================
// 3) INVENTORY — all 80 catalog drugs (some below reorder level)
// =============================================================================

export const seedInventory: InventoryItem[] = DRUGS.map((d, i) => {
  const reorderLevel = d.form === "Injection" ? randInt(15, 25) : randInt(40, 80);
  // ~18% intentionally low/critical so the inventory page shows alerts.
  const quantity = chance(0.18) ? randInt(0, reorderLevel) : randInt(reorderLevel + 10, reorderLevel * 4);
  return {
    id: `inv_${i}`,
    name: d.name,
    form: d.form,
    route: d.route,
    quantity,
    unit: d.unit,
    reorderLevel,
    updatedAt: at(randInt(0, 3), "10:00").toISOString(),
  };
});

// =============================================================================
// 4) MEDICINE SCHEDULES — 150 (≈3 per patient)
// =============================================================================

export const seedMedicines: Medicine[] = [];
for (let i = 0; i < 150; i++) {
  const patient = seedPatients[i % seedPatients.length];
  const drug = pick(DRUGS);
  const frequency = pick(FREQS);
  const startAgo = randInt(0, 6);
  const durationDays = randInt(3, 14);
  seedMedicines.push({
    id: `med_${i}`,
    patientId: patient.id,
    name: drug.name,
    dosage: drug.dose,
    frequency,
    route: drug.route,
    times: FREQ_TIMES[frequency],
    startDate: at(startAgo, "00:00").toISOString(),
    endDate: at(startAgo - durationDays, "23:59").toISOString(),
    notes: chance(0.25) ? pick(["Give with food", "Monitor BP", "Check sugar before dose", "Watch for drowsiness"]) : undefined,
    createdAt: today.toISOString(),
  });
}

// =============================================================================
// 5) DOSES — today's backlog + a week of history, with mixed statuses
// =============================================================================

export const seedDoses: Dose[] = [];
const seenDose = new Set<string>(); // dedupe by medicineId|ISO
let doseCounter = 0;

function pushDose(med: Medicine, scheduled: Date, status: DoseStatus) {
  const iso = scheduled.toISOString();
  const key = `${med.id}|${iso}`;
  if (seenDose.has(key)) return;
  seenDose.add(key);

  let givenAt: string | null = null;
  let nurseId: string | null = null;
  const wardNurses = nursesInWard(seedPatients.find((p) => p.id === med.patientId)?.ward ?? "");

  if (status === "GIVEN") {
    givenAt = new Date(scheduled.getTime() + randInt(0, 12) * 60000).toISOString();
    nurseId = pick(wardNurses);
  } else if (status === "DELAYED") {
    givenAt = new Date(scheduled.getTime() + randInt(20, 110) * 60000).toISOString();
    nurseId = pick(wardNurses);
  } else if (status === "MISSED") {
    nurseId = pick(wardNurses);
  }

  seedDoses.push({
    id: `dose_${doseCounter++}`,
    medicineId: med.id,
    patientId: med.patientId,
    scheduledAt: iso,
    givenAt,
    status,
    nurseId,
    notes:
      status === "MISSED"
        ? pick(["Patient refused", "Patient NPO for procedure", "Patient off ward (imaging)"])
        : status === "DELAYED"
          ? pick(["Pharmacy delay", "Patient was asleep", "Awaiting vitals"])
          : null,
    createdAt: today.toISOString(),
  });
}

// Weighted status for a dose already in the past.
function pastStatus(): DoseStatus {
  const r = rand();
  if (r < 0.62) return "GIVEN";
  if (r < 0.78) return "DELAYED";
  if (r < 0.88) return "MISSED";
  return "PENDING"; // overdue / not yet actioned
}

// (a) TODAY backlog: every schedule time already passed today gets a record,
// mostly handled so the dashboard shows a realistic given/delayed/missed mix
// (and only a manageable number remain overdue/pending).
for (const med of seedMedicines) {
  for (const time of med.times) {
    const when = at(0, time);
    if (when <= today) pushDose(med, when, pastStatus());
  }
}

// (b) HISTORY: 200 more records spread over the previous 6 days so the
// analytics 7-day trend and the logs page always look full (independent of
// what time of day the seed first runs).
for (let i = 0; i < 200; i++) {
  const med = pick(seedMedicines);
  const daysAgo = randInt(1, 6);
  const time = pick(med.times);
  const r = rand();
  const status: DoseStatus = r < 0.68 ? "GIVEN" : r < 0.85 ? "DELAYED" : "MISSED";
  pushDose(med, at(daysAgo, time), status);
}

// =============================================================================
// 6) PRESCRIPTIONS — 40 active
// =============================================================================

export const seedPrescriptions: Prescription[] = [];
for (let i = 0; i < 40; i++) {
  const patient = pick(seedPatients);
  const itemCount = randInt(1, 3);
  const items = Array.from({ length: itemCount }, () => {
    const drug = pick(DRUGS);
    const frequency = pick(FREQS);
    return {
      medicineName: drug.name,
      dosage: drug.dose,
      frequency,
      times: FREQ_TIMES[frequency],
      durationDays: randInt(3, 10),
    };
  });
  seedPrescriptions.push({
    id: `rx_${i}`,
    patientId: patient.id,
    doctorName: patient.doctor,
    diagnosis: patient.condition,
    date: toDateKey(at(randInt(0, 5), "09:00")),
    status: "ACTIVE",
    items,
    notes: chance(0.4) ? pick(["Review in 3 days", "Monitor renal function", "Repeat CBC after course", "Counsel on diet"]) : undefined,
    createdAt: today.toISOString(),
  });
}

// =============================================================================
// 7) SHIFTS — 30 roster records (today + tomorrow)
// =============================================================================

export const seedShifts: ShiftAssignment[] = [];
NURSES.forEach((n, i) => {
  if (i >= 25) return;
  seedShifts.push({
    id: `sh_${i}`,
    nurseId: n.id,
    date: todayKey,
    shift: n.shift ?? shiftKeys[i % shiftKeys.length],
    ward: n.ward ?? "General Ward A",
    createdAt: today.toISOString(),
  });
});
// 5 extra for tomorrow to push the count to 30.
const tomorrowKey = toDateKey(at(-1, "00:00"));
for (let i = 0; i < 5; i++) {
  const n = NURSES[i];
  seedShifts.push({
    id: `sh_t_${i}`,
    nurseId: n.id,
    date: tomorrowKey,
    shift: shiftKeys[(i + 1) % shiftKeys.length],
    ward: n.ward ?? "General Ward A",
    createdAt: today.toISOString(),
  });
}

// =============================================================================
// 8) ALERTS — 20 records (escalations + emergencies, mostly resolved)
// =============================================================================

export const seedAlerts: Alert[] = [];
const ESC_LEVELS: { level: 1 | 2 | 3; role: Role; label: string }[] = [
  { level: 1, role: "NURSE", label: "Remind nurse" },
  { level: 2, role: "HEAD_NURSE", label: "Alert head nurse" },
  { level: 3, role: "DOCTOR", label: "Alert doctor" },
];
const ackNames = ["Priya Sharma", "Dr. Samuel Menon", "Amelia Carter", "Raj Verma"];

// 14 escalation alerts
for (let i = 0; i < 14; i++) {
  const patient = pick(seedPatients);
  const drug = pick(DRUGS);
  const esc = pick(ESC_LEVELS);
  const mins = esc.level === 3 ? randInt(60, 120) : esc.level === 2 ? randInt(30, 55) : randInt(15, 28);
  const active = i < 3; // a few still open
  seedAlerts.push({
    id: `alert_esc_${i}`,
    type: "ESCALATION",
    level: esc.level,
    targetRole: esc.role,
    patientId: patient.id,
    ward: patient.ward,
    message: `${esc.label} — ${drug.name} ${drug.dose} for ${patient.name} (Bed ${patient.bedNumber}) is ${mins} min overdue.`,
    acknowledged: !active,
    acknowledgedBy: active ? null : pick(ackNames),
    createdAt: at(active ? 0 : randInt(0, 2), `${randInt(7, 20)}:${randInt(10, 59)}`).toISOString(),
  });
}

// 6 emergency alerts (all acknowledged so no permanent banner on load)
for (let i = 0; i < 6; i++) {
  const code = pick(EMERGENCY_CODES);
  const ward = pick(WARDS).name;
  seedAlerts.push({
    id: `alert_em_${i}`,
    type: "EMERGENCY",
    code: code.code,
    ward,
    message: `${code.code} — ${code.desc} in ${ward}.`,
    acknowledged: true,
    acknowledgedBy: pick(ackNames),
    createdAt: at(randInt(0, 3), `${randInt(1, 23)}:${randInt(10, 59)}`).toISOString(),
  });
}

export const SEED_TODAY_KEY = todayKey;
