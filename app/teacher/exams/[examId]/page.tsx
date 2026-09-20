import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { TOOL_LABELS, ToolId } from "@/lib/blocks";

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "En cours",
  SUBMITTED: "Soumise",
};

export default async function TeacherExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await requireUser("TEACHER");
  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subject: true,
      questions: { orderBy: { order: "asc" } },
      submissions: {
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!exam || exam.teacherId !== session.sub) notFound();

  return (
    <div className="flex flex-1 flex-col bg-soft">
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-paper px-8">
        <Link href="/teacher" className="text-[13px] font-medium text-ink-2 hover:text-blue">
          ← Retour
        </Link>
        <div className="h-6 w-px bg-line" />
        <Logo height={26} />
        <span className="text-[15px] font-bold text-navy">{exam.title}</span>
        <div className="flex-1" />
        <Link
          href={`/teacher/exams/${exam.id}/edit`}
          className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-ink-2 hover:border-blue hover:text-blue"
        >
          Modifier
        </Link>
        <Link
          href={`/teacher/new?duplicate=${exam.id}`}
          className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-ink-2 hover:border-blue hover:text-blue"
        >
          Dupliquer / Importer
        </Link>
      </header>

      <main className="flex flex-1 flex-col gap-8 px-14 py-10">
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-paper px-7 py-5">
          <div className="text-[13px] text-ink-2">
            {exam.subject.name} · {exam.durationMin} min · {exam.questions.length} questions ·{" "}
            {exam.status === "PUBLISHED" ? "Publié" : exam.status === "DRAFT" ? "Brouillon" : "Clôturé"}
          </div>
          <div className="flex flex-col gap-2">
            {exam.questions.map((q) => (
              <div key={q.id} className="text-sm text-ink">
                <span className="font-semibold">Q{q.order}.</span> {q.prompt}{" "}
                <span className="text-ink-3">
                  ({q.points} pts — {q.allowedTools.map((t) => TOOL_LABELS[t as ToolId] ?? t).join(", ")})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold">
            Copies ({exam.submissions.filter((s) => s.status === "SUBMITTED").length} soumise
            {exam.submissions.filter((s) => s.status === "SUBMITTED").length > 1 ? "s" : ""} sur{" "}
            {exam.submissions.length})
          </h2>

          {exam.submissions.length === 0 && (
            <p className="text-sm text-ink-2">Aucun étudiant n&apos;a encore commencé cet examen.</p>
          )}

          <div className="flex flex-col gap-2">
            {exam.submissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-xl border border-line bg-paper px-6 py-4"
              >
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold">{s.student.name}</span>
                  <span className="text-xs text-ink-3">{s.student.email}</span>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    s.status === "SUBMITTED" ? "bg-[#E8F5EE] text-good" : "bg-pale text-navy-2"
                  }`}
                >
                  {STATUS_LABEL[s.status]}
                </span>
                <Link
                  href={`/teacher/exams/${exam.id}/submissions/${s.id}`}
                  className="rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-white"
                >
                  Voir la copie
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
