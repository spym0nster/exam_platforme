import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "TEACHER" ? "/teacher" : "/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center bg-soft p-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-11 shadow-sm">
        <div className="mb-7 flex flex-col items-center gap-2.5">
          <Logo height={52} />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue">
            Digital Assessment Platform
          </span>
        </div>

        <div className="mb-6 flex flex-col gap-1.5 text-center">
          <h1 className="text-3xl font-extrabold text-navy">Bienvenue</h1>
          <p className="text-sm text-ink-2">
            Connectez-vous pour accéder à vos matières et évaluations.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
