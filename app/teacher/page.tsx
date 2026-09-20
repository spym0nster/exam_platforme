import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  CLOSED: "Clôturé",
};

export default async function TeacherPage() {
  const session = await requireUser("TEACHER");

  const exams = await prisma.exam.findMany({
    where: { teacherId: session.sub },
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      questions: { select: { id: true } },
      submissions: { select: { id: true, status: true } },
    },
  });

  return (
    <div className="flex flex-1 flex-col bg-soft">
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-paper px-8">
        <Logo height={26} />
        <span className="text-[15px] font-bold text-navy">Espace enseignant</span>
        <div className="flex-1" />
        <span className="text-sm text-ink-2">{session.name}</span>
        <LogoutButton />
      </header>

      <main className="flex flex-1 flex-col gap-7 px-14 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-extrabold text-navy">Vos évaluations</h1>
          <Link
            href="/teacher/new"
            className="rounded-lg bg-blue px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Créer un examen
          </Link>
        </div>

        {exams.length === 0 && (
          <p className="text-sm text-ink-2">Vous n&apos;avez pas encore créé d&apos;examen.</p>
        )}

        <div className="flex flex-col gap-3">
          {exams.map((exam) => {
            const submitted = exam.submissions.filter((s) => s.status === "SUBMITTED").length;
            return (
              <Link
                key={exam.id}
                href={`/teacher/exams/${exam.id}`}
                className="flex items-center gap-6 rounded-2xl border border-line bg-paper px-7 py-5 hover:border-blue"
              >
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold">{exam.title}</span>
                    <span className="rounded-md bg-pale px-2 py-0.5 text-[11px] font-semibold text-navy-2">
                      {STATUS_LABEL[exam.status]}
                    </span>
                  </div>
                  <div className="text-[13px] text-ink-2">
                    {exam.subject.name} · {exam.questions.length} questions · {exam.durationMin} min ·{" "}
                    {submitted} copie{submitted > 1 ? "s" : ""} soumise{submitted > 1 ? "s" : ""}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
