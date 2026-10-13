"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { signInAction } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(signInAction, undefined);

  return (
    <form action={action} className="neon-frame glass w-full max-w-sm space-y-4 p-8">
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-neon bg-neon/10 shadow-neon">
          <Lock size={20} aria-hidden />
        </span>
        <h1 className="chrome-text mt-4 text-2xl font-black">Staff Sign In</h1>
        <p className="mt-1 text-sm text-chrome-dim">Source 1 Auto Group admin</p>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-wider text-chrome-dark">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input-dark" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-xs uppercase tracking-wider text-chrome-dark">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input-dark" />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg border border-hot/40 bg-hot/10 px-3 py-2 text-sm text-hot">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-hot w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
