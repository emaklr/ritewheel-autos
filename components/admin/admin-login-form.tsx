"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setError(result.error ?? "Sign-in failed. Please try again.");
        return;
      }

      setPassword("");
      router.replace(result.redirectTo ?? "/admin");
      router.refresh();
    } catch {
      setError("We could not reach the sign-in service. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <label className="admin-field">
        <span>Email address</span>
        <input
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@dealership.com"
        />
      </label>
      <label className="admin-field">
        <span>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
        />
      </label>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <button className="button button-gold admin-login-submit" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in securely"}
      </button>
    </form>
  );
}
