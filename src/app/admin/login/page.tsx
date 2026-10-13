import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Staff Sign In | Source 1 Auto Group", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <LoginForm />
    </div>
  );
}
