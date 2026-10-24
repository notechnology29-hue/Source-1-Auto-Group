import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, PageShell } from "@/components/layout/PageShell";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | Source 1 Auto Group",
  description: "How Source 1 Auto Group collects, uses, and protects your personal information.",
};

const LINK = "text-blue-500 underline";

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" intro="Last updated: October 23, 2026">
      <InfoCard id="overview" title="Overview">
        <p>
          {BRAND.name} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what information we collect through this website,
          how we use it, who we share it with, and the choices you have.
        </p>
      </InfoCard>

      <InfoCard id="collect" title="Information We Collect">
        <p><strong>Contact and inquiry forms</strong> (Hold My Ride, test drive requests, and Send Us a Message): your name, email address, phone number, any message you write, and the vehicle you asked about.</p>
        <p><strong>Credit applications:</strong> your name, contact details, address, housing and employment information, income, requested loan amount, date of birth, Social Security number, and driver&apos;s license details. If you add a co-applicant, the same information about them.</p>
        <p><strong>Automatic information:</strong> basic technical data such as IP address, browser type, and pages requested, which our hosting provider records in server logs for security and reliability.</p>
        <p>We do not require you to create an account to browse our inventory.</p>
      </InfoCard>

      <InfoCard id="use" title="How We Use Your Information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To respond to your inquiry, hold a vehicle, or schedule a test drive.</li>
          <li>To process your credit application and arrange financing with lending partners.</li>
          <li>To notify our sales team that a new request has arrived.</li>
          <li>To operate, secure, and improve the website, and to prevent fraud and abuse.</li>
          <li>To comply with legal obligations.</li>
        </ul>
      </InfoCard>

      <InfoCard id="sensitive" title="How We Protect Sensitive Data">
        <p>
          Your Social Security number, date of birth, and driver&apos;s license information are encrypted with AES-256-GCM before they are stored, and the
          connection between your browser and our site is encrypted using HTTPS. Access to customer records is limited to authorized staff who sign in
          with a password. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.
        </p>
      </InfoCard>

      <InfoCard id="sharing" title="Who We Share It With">
        <p>We do not sell your personal information. We share it only as needed to run our business:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Lenders and financing partners</strong>, when you submit a credit application, so they can evaluate it.</li>
          <li><strong>Service providers</strong> that host our site and database, store our vehicle photos and videos, and deliver email or chat notifications to our staff. They may handle your information only to provide those services to us.</li>
          <li><strong>Messaging apps:</strong> after you submit a hold or test-drive request, we may open a pre-filled WhatsApp or text message to our sales team. That message is sent only if you choose to send it.</li>
          <li><strong>Authorities</strong>, when required by law or to protect our rights and the safety of others.</li>
        </ul>
      </InfoCard>

      <InfoCard id="cookies" title="Cookies">
        <p>
          The public website does not use advertising or tracking cookies. Our staff sign-in uses a session cookie that is needed only for the
          administration area.
        </p>
      </InfoCard>

      <InfoCard id="retention" title="How Long We Keep Information">
        <p>
          We keep inquiries and credit applications only as long as needed for the purposes above and to meet legal and record-keeping requirements,
          then delete or anonymize them.
        </p>
      </InfoCard>

      <InfoCard id="rights" title="Your Choices">
        <p>
          You may ask us to access, correct, or delete the personal information we hold about you, or to stop contacting you, by calling{" "}
          <a href={BRAND.phoneHref} className={LINK}>{BRAND.phoneDisplay}</a> or using the{" "}
          <Link href="/#contact" className={LINK}>contact form</Link>. We may need to keep some records where the law requires it.
        </p>
      </InfoCard>

      <InfoCard id="children" title="Children">
        <p>This website is not directed to children under 13, and we do not knowingly collect their information.</p>
      </InfoCard>

      <InfoCard id="changes" title="Changes to This Policy">
        <p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>
      </InfoCard>

      <InfoCard id="contact" title="Contact Us">
        <address className="not-italic">
          {BRAND.name}<br />
          {BRAND.addressLine1}, {BRAND.addressLine2}<br />
          <a href={BRAND.phoneHref} className={LINK}>{BRAND.phoneDisplay}</a>
        </address>
      </InfoCard>
    </PageShell>
  );
}
