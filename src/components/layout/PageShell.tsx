import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function PageShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <div className="border-b border-blue-900/50 bg-zinc-50 px-4 py-10 text-center sm:px-6">
          <h1 className="text-3xl font-black text-zinc-900 sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-2 max-w-2xl text-zinc-600">{intro}</p>
        </div>
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export function InfoCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-40 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
      <h2 className="text-xl font-extrabold uppercase tracking-wide text-zinc-900">{title}</h2>
      <div className="mt-3 space-y-3 text-zinc-600">{children}</div>
    </section>
  );
}
