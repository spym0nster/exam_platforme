"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS = [
  { label: "Étudiant", email: "sami.trabelsi@esen.tn", password: "password123" },
  { label: "Enseignant", email: "imene.gharbi@esen.tn", password: "password123" },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      router.push(data.redirect);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-ink-2">
          Adresse e-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="prenom.nom@esen.tn"
          className="h-11 rounded-lg border border-line bg-soft px-3.5 text-sm text-ink outline-none focus:border-blue"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-ink-2">
          Mot de passe
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          className="h-11 rounded-lg border border-line bg-soft px-3.5 text-sm text-ink outline-none focus:border-blue"
        />
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-lg bg-blue text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <div className="flex flex-col gap-2 border-t border-pale pt-4 text-center">
        <span className="text-xs text-ink-3">Comptes de démonstration</span>
        <div className="flex gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                setPassword(acc.password);
              }}
              className="flex-1 rounded-md border border-line py-1.5 text-xs font-medium text-ink-2 hover:border-blue hover:text-blue"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
