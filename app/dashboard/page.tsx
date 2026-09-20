import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await requireUser("STUDENT");

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      exams: {
        where: { status: "PUBLISHED" },
        include: {
          submissions: { where: { studentId: session.sub } },
          questions: { select: { id: true } },
        },
      },
    },
  });

  const subjectsWithExams = subjects.filter((s) => s.exams.length > 0);
  const subjectsWithoutExams = subjects.filter((s) => s.exams.length === 0);
  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-1 bg-soft">
      <aside className="flex w-[280px] shrink-0 flex-col gap-6 border-r border-line bg-paper px-5 py-7">
        <div className="border-b border-pale px-1 pb-3">
          <Logo height={34} />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            Matières
          </div>
          {subjects.map((subject) => {
            const active = subject.exams.length > 0;
            return (
              <div
                key={subject.id}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13.5px] ${
                  active ? "bg-pale font-semibold text-blue" : "text-ink-2"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    active ? "bg-blue" : "bg-line"
                  }`}
                />
                <span className="flex-1">{subject.name}</span>
                <span className={`text-[11px] ${active ? "text-blue" : "text-ink-3"}`}>
                  {active ? subject.exams.length : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex flex-1 flex-col gap-8 overflow-hidden px-14 py-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-ink-3">Tableau de bord — Étudiant</span>
            <h1 className="text-[28px] font-extrabold text-navy">Bonjour, {session.name.split(" ")[0]}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pale text-sm font-bold text-blue">
              {initials}
            </div>
            <LogoutButton />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold">Vos évaluations</h2>

          {subjectsWithExams.length === 0 && (
            <p className="text-sm text-ink-2">Aucune évaluation disponible pour le moment.</p>
          )}

          <div className="flex flex-col gap-3.5">
            {subjectsWithExams.map((subject) =>
              subject.exams.map((exam) => {
                const submission = exam.submissions[0];
                const submitted = submission?.status === "SUBMITTED";
                const started = Boolean(submission) && !submitted;
                return (
                  <div
                    key={exam.id}
                    className="flex items-center gap-6 rounded-2xl border border-line bg-paper px-7 py-6"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue text-lg font-bold text-white">
                      {subject.name[0]}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15.5px] font-semibold">{exam.title}</span>
                        {submitted ? (
                          <span className="rounded-md bg-pale px-2 py-0.5 text-[11px] font-semibold text-navy-2">
                            Soumis
                          </span>
                        ) : (
                          <span className="rounded-md bg-[#E8F5EE] px-2 py-0.5 text-[11px] font-semibold text-good">
                            Disponible
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-ink-2">
                        {exam.questions.length} questions · Durée {exam.durationMin} min
                      </div>
                    </div>
                    {submitted ? (
                      <span className="shrink-0 rounded-lg bg-pale px-5 py-2.5 text-[13.5px] font-semibold text-ink-3">
                        Copie soumise
                      </span>
                    ) : (
                      <Link
                        href={`/exam/${exam.id}`}
                        className="shrink-0 rounded-lg bg-blue px-5 py-2.5 text-[13.5px] font-semibold text-white"
                      >
                        {started ? "Reprendre l'examen" : "Commencer l'examen"}
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {subjectsWithoutExams.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold text-ink-2">Prochainement</h2>
            <div className="flex flex-wrap gap-2">
              {subjectsWithoutExams.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs text-ink-3"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-pale pt-4 text-xs text-ink-3">
          Une seule plateforme pour toutes les matières — les outils s&apos;adaptent
          automatiquement à chaque examen.
        </div>
      </main>
    </div>
  );
}
