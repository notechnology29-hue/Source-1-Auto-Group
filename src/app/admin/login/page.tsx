import type { Metadata } from "next";
import { PoweredBy } from "@/components/PoweredBy";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Staff Sign In | Source 1 Auto Group", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <LoginForm />
      <PoweredBy />
    </div>
  );
}
