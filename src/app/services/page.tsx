import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock, Hammer, MessageSquare, Phone, ShieldCheck, Sparkles, SprayCan, Wrench, type LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services: Detailing, Auto Repair, Paint and Body | Source 1 Auto Group",
  description:
    "Professional auto detailing, repair and maintenance, and collision, paint and body work in Phoenix, AZ. Honest quotes and a written warranty on every job.",
  alternates: { canonical: "/services" },
};

interface Item { name: string; price: string; blurb: string; includes: string[]; popular?: boolean }
interface Service {
  id: string;
  title: string;
  icon: LucideIcon;
  tagline: string;
  items: Item[];
  steps: string[];
  turnaround: string;
  warranty: string;
}

const SERVICES: Service[] = [
  {
    id: "detailing",
    title: "Detailing",
    icon: Sparkles,
    tagline: "Showroom shine, inside and out. Hand finished by detailers who treat every car like their own.",
    items: [
      {
        name: "Express Wash & Wax",
        price: "From $75",
        blurb: "A quick refresh that keeps a daily driver looking sharp.",
        includes: ["Hand wash and dry", "Spray wax and tire shine", "Window cleaning inside and out", "Interior vacuum and wipe-down"],
      },
      {
        name: "Full Interior & Exterior",
        price: "From $225",
        blurb: "Our most requested detail, ideal before you sell or after a road trip.",
        includes: ["Clay bar paint decontamination", "Machine-applied wax or sealant", "Carpet and upholstery shampoo", "Leather clean and condition", "Door jambs, vents and console detail"],
        popular: true,
      },
      {
        name: "Ceramic Coating",
        price: "From $795",
        blurb: "Multi-year gloss and protection against Arizona sun and bird droppings.",
        includes: ["Single-stage paint correction", "Professional ceramic coating", "Wheel faces and glass coated", "Cure-time care instructions"],
      },
    ],
    steps: ["Inspect and photograph", "Wash and decontaminate", "Correct and protect", "Final walk-through"],
    turnaround: "Same day to 2 days",
    warranty: "Coatings carry a written 2-year warranty",
  },
  {
    id: "auto-repair",
    title: "Auto Repair",
    icon: Wrench,
    tagline: "Honest diagnostics and fair prices. We show you what's wrong and get your approval before any work starts.",
    items: [
      {
        name: "Oil Change & Inspection",
        price: "From $59",
        blurb: "Synthetic-blend oil and filter with a free multi-point inspection.",
        includes: ["Up to 5 quarts of oil", "New oil filter", "Fluid top-off", "Tire, brake and battery check"],
      },
      {
        name: "Brakes & Suspension",
        price: "From $189 per axle",
        blurb: "Stop confidently with quality pads, rotors and hardware.",
        includes: ["Pad and rotor replacement", "Brake fluid check", "Caliper and hardware service", "Road test after repair"],
        popular: true,
      },
      {
        name: "A/C & Cooling",
        price: "From $129",
        blurb: "Arizona heat is hard on a car. Keep the cabin and the engine cool.",
        includes: ["A/C performance and leak test", "Refrigerant recharge", "Coolant flush and fill", "Radiator and hose inspection"],
      },
      {
        name: "Check Engine Diagnostics",
        price: "$99 (applied to repair)",
        blurb: "Full scan and a plain-English explanation of the problem.",
        includes: ["OBD-II code scan", "Live data and test drive", "Written estimate", "Cost applied if you repair with us"],
      },
    ],
    steps: ["Drop off or schedule", "Diagnose and quote", "You approve the work", "Repair and road test"],
    turnaround: "Most repairs in 1 to 2 days",
    warranty: "12-month / 12,000-mile parts and labor warranty",
  },
  {
    id: "paint-and-body",
    title: "Paint and Body",
    icon: SprayCan,
    tagline: "From door dings to full collision repair, we restore panels and color so the damage disappears.",
    items: [
      {
        name: "Dent & Scratch Repair",
        price: "From $150",
        blurb: "Small dents, door dings and scuffs fixed without a full repaint.",
        includes: ["Paintless dent repair where possible", "Spot sanding and blending", "Color-matched touch-up", "Clear coat finish"],
      },
      {
        name: "Collision Repair",
        price: "Free estimate",
        blurb: "Bumpers to quarter panels, repaired to factory fit and finish.",
        includes: ["Insurance claim assistance", "Frame and panel straightening", "Computerized color matching", "Post-repair quality inspection"],
        popular: true,
      },
      {
        name: "Full & Panel Repaint",
        price: "From $1,495",
        blurb: "Faded or sun-damaged clear coat made new again.",
        includes: ["Complete prep and priming", "Base coat and multi-layer clear", "Bake-cured finish", "Trim, handle and emblem removal and refit"],
      },
    ],
    steps: ["Free written estimate", "Disassemble and repair", "Prime, paint and cure", "Reassemble and inspect"],
    turnaround: "3 to 10 days, depending on damage",
    warranty: "Lifetime warranty on paint and workmanship for as long as you own the vehicle",
  },
];

const WHY = [
  { icon: ShieldCheck, title: "Written warranty", text: "Every job is backed in writing, so you know exactly what's covered." },
  { icon: MessageSquare, title: "No surprises", text: "You get a clear quote up front and we call before doing anything extra." },
  { icon: Clock, title: "Fast turnaround", text: "Clear timelines and updates by call or text, so you're never left guessing." },
  { icon: Hammer, title: "Skilled technicians", text: "Experienced detailers, mechanics and body techs, all under one roof." },
];

const FAQS = [
  { q: "Do I have to buy my car from you to use these services?", a: "Not at all. We service every make and model, and customers who bought from us get priority scheduling." },
  { q: "Can you give me a quote before I come in?", a: "Yes. Call or text a few photos and your vehicle details, and we'll give you a ballpark price. Final pricing is confirmed after an in-person inspection." },
  { q: "Do you work with insurance companies?", a: "Yes. We handle the paperwork and work directly with your adjuster on collision claims. You choose which shop repairs your car." },
  { q: "Do you offer a loaner or ride?", a: "For repairs lasting more than a day, ask us about a local ride or a courtesy vehicle from our lot." },
  { q: "How do I pay?", a: "We accept cash, all major cards and financing for larger repairs. Ask about our payment options." },
];

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-6 font-bold uppercase tracking-wider transition";

export default function ServicesPage() {
  return (
    <PageShell
      title="Service, Repair & Finish Under One Roof."
      intro="Detailing, auto repair, and paint and body from the team that keeps your car looking and running its best."
    >
      <nav aria-label="Service categories" className="flex flex-wrap justify-center gap-2">
        {SERVICES.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 text-sm font-bold uppercase tracking-wider text-zinc-800 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <s.icon size={16} aria-hidden /> {s.title}
          </a>
        ))}
      </nav>

      {SERVICES.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-40 rounded-lg border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-blue-500">
              <s.icon size={26} aria-hidden />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold uppercase tracking-wide text-zinc-900">{s.title}</h2>
              <p className="mt-1 text-zinc-600">{s.tagline}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.items.map((i) => (
              <article key={i.name} className={`relative flex flex-col rounded-lg border bg-white p-5 ${i.popular ? "border-blue-600 shadow-md" : "border-zinc-200"}`}>
                {i.popular && (
                  <span className="absolute -top-3 left-4 rounded-full bg-red-600 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">Most popular</span>
                )}
                <h3 className="text-lg font-bold text-zinc-900">{i.name}</h3>
                <p className="mt-1 text-lg font-extrabold text-blue-700">{i.price}</p>
                <p className="mt-2 text-sm text-zinc-600">{i.blurb}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-zinc-700">
                  {i.includes.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-blue-600" aria-hidden /> {x}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-4">
            {s.steps.map((step, n) => (
              <li key={step} className="flex items-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">{n + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-col gap-2 text-sm text-zinc-700 sm:flex-row sm:flex-wrap sm:gap-x-8">
            <p className="flex items-center gap-2"><Clock size={16} className="text-blue-600" aria-hidden /> <strong>Typical turnaround:</strong> {s.turnaround}</p>
            <p className="flex items-center gap-2"><ShieldCheck size={16} className="text-blue-600" aria-hidden /> {s.warranty}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={BRAND.phoneHref} className={`${btn} bg-red-600 text-white hover:bg-red-700`}>
              <Phone size={16} aria-hidden /> Call for a Quote
            </a>
            <Link href="/#contact" className={`${btn} border border-zinc-300 bg-white text-zinc-800 hover:border-blue-600 hover:text-blue-700`}>
              Send Us a Message
            </Link>
          </div>
        </section>
      ))}

      <section aria-labelledby="why-us" className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
        <h2 id="why-us" className="text-xl font-extrabold uppercase tracking-wide text-zinc-900">Why Source 1 Service</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {WHY.map((w) => (
            <div key={w.title} className="flex gap-3">
              <w.icon size={22} className="mt-0.5 shrink-0 text-blue-600" aria-hidden />
              <div>
                <h3 className="font-bold text-zinc-900">{w.title}</h3>
                <p className="text-sm text-zinc-600">{w.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq" className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
        <h2 id="faq" className="text-xl font-extrabold uppercase tracking-wide text-zinc-900">Frequently Asked Questions</h2>
        <div className="mt-4 divide-y divide-zinc-200">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-900">
                {f.q}
                <span aria-hidden className="text-xl text-blue-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="pb-2 text-zinc-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-zinc-950 p-6 text-center sm:p-8">
        <h2 className="text-2xl font-extrabold text-white">Ready to book?</h2>
        <p className="mt-1 text-zinc-400">Call or visit us at {BRAND.addressLine1}, {BRAND.addressLine2}. Prices shown are starting estimates and may vary by vehicle.</p>
        <a href={BRAND.phoneHref} className={`${btn} mt-4 bg-red-600 text-white hover:bg-red-700`}>
          <Phone size={16} aria-hidden /> {BRAND.phoneDisplay}
        </a>
      </section>
    </PageShell>
  );
}
