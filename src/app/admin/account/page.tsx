import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Account | Chrisslaymedia" };

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="p-10 text-chrome-dim">Loading…</p>}>
      <Account />
    </Suspense>
  );
}

async function Account() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-sm text-neon-light hover:underline">← Dashboard</Link>
      <h1 className="chrome-text mt-3 text-3xl font-black">Account</h1>
      <p className="mb-6 text-sm text-chrome-dim">Signed in as {admin.user.email}</p>
      <h2 className="mb-3 text-lg font-bold text-white">Change password</h2>
      <ChangePasswordForm />
    </main>
  );
}
