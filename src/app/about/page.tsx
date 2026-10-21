import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, PageShell } from "@/components/layout/PageShell";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "About Us | Source 1 Auto Group" };

export default function AboutPage() {
  return (
    <PageShell title="About Us" intro={BRAND.tagline}>
      <InfoCard id="dealership" title="Our Dealership">
        <p>Source 1 Auto Group sells hand-picked pre-owned vehicles with nothing hidden. Every flaw, upgrade, and repair is disclosed on the photos.</p>
      </InfoCard>
      <InfoCard id="testimonials" title="Testimonials">
        <p>Customer reviews are coming soon.</p>
      </InfoCard>
      <InfoCard id="team" title="Our Team">
        <p>Meet the people behind Source 1. Team profiles are coming soon.</p>
      </InfoCard>
      <InfoCard id="careers" title="Careers">
        <p>Interested in joining us? Send a note through the <Link href="/#contact" className="text-blue-500 underline">contact form</Link>.</p>
      </InfoCard>
    </PageShell>
  );
}
