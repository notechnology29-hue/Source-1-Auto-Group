import { AlertTriangle, CheckCircle2, ExternalLink, Gauge, UserCheck, Wrench } from "lucide-react";
import { getCarfaxReport } from "@/app/actions/getCarfaxReport";
import { miles } from "@/lib/format";

interface Props {
  vin: string;
  /** Vehicle-specific report link saved in the database; otherwise a VIN link is generated. */
  carfaxUrl?: string | null;
}

function Badge({ icon: Icon, label, value, good = true }: { icon: typeof Gauge; label: string; value: string; good?: boolean }) {
  return (
    <li className={`flex items-start gap-3 rounded-md border bg-white p-4 ${good ? "border-zinc-200" : "border-red-600/60"}`}>
      <Icon size={22} className={`mt-0.5 shrink-0 ${good ? "text-blue-500" : "text-red-500"}`} aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
        <p className="mt-0.5 break-words font-bold text-zinc-900">{value}</p>
      </div>
    </li>
  );
}

export async function CarfaxReportSection({ vin, carfaxUrl }: Props) {
  const result = await getCarfaxReport(vin);

  return (
    <section id="carfax" aria-labelledby="carfax-heading" className="overflow-hidden rounded-lg border border-blue-900/50 bg-zinc-50 shadow-neon">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-4">
        <h2 id="carfax-heading" className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-zinc-900">CARFAX</span>
          <span className="text-sm font-semibold text-zinc-700">Vehicle History Report&trade; Summary</span>
        </h2>
        <p className="font-mono text-xs text-zinc-500">VIN {vin}</p>
      </header>

      {result.ok ? (
        <div className="p-5">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Badge icon={result.data.titleClean ? CheckCircle2 : AlertTriangle} label="Title History" value={result.data.titleText} good={result.data.titleClean} />
            <Badge icon={result.data.accidentCount === 0 ? CheckCircle2 : AlertTriangle} label="Accident / Damage" value={result.data.accidentText} good={result.data.accidentCount === 0} />
            <Badge icon={UserCheck} label="Previous Owners" value={result.data.ownerText} />
            <Badge icon={Wrench} label="Service History" value={result.data.serviceText} />
            <Badge icon={Gauge} label="Last Reported Odometer" value={result.data.lastOdometer === null ? "Not reported" : miles(result.data.lastOdometer)} />
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href={carfaxUrl || result.data.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-blue-600 px-6 font-bold uppercase tracking-wider text-white transition hover:bg-blue-700"
            >
              View Full CARFAX Report <ExternalLink size={16} aria-hidden />
            </a>
            {result.data.isMock && (
              <p className="text-xs text-zinc-500">Sample data shown. Add CARFAX_API_URL and CARFAX_API_KEY to .env.local to display live reports.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <p className="text-zinc-600">{result.error} You can still open the full report on CARFAX.</p>
          <a
            href={carfaxUrl || `https://www.carfax.com/VehicleHistory/p/Report.cfx?vin=${encodeURIComponent(vin)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-md bg-blue-600 px-6 font-bold uppercase tracking-wider text-white transition hover:bg-blue-700"
          >
            View Full CARFAX Report <ExternalLink size={16} aria-hidden />
          </a>
        </div>
      )}
    </section>
  );
}
