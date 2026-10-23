"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/app/actions/auth";

const FIELDS = [
  { name: "current", label: "Current password", autoComplete: "current-password" },
  { name: "next", label: "New password (10+ characters)", autoComplete: "new-password" },
  { name: "confirm", label: "Confirm new password", autoComplete: "new-password" },
] as const;

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-white/10 bg-carbon-50 p-6">
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="mb-1 block text-xs uppercase tracking-wider text-chrome-dark">{f.label}</label>
          <input id={f.name} name={f.name} type="password" required minLength={f.name === "next" ? 10 : undefined} autoComplete={f.autoComplete} className="input-dark" />
        </div>
      ))}

      {state?.error && (
        <p role="alert" className="rounded-lg border border-hot/40 bg-hot/10 px-3 py-2 text-sm text-hot">{state.error}</p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Password updated.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-hot w-full">
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
