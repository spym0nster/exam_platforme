import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { AnswerBlocksView } from "@/components/BlockRenderer";
import type { Block } from "@/lib/blocks";

export default async function TeacherSubmissionPage({
  params,
}: {
  params: Promise<{ examId: string; submissionId: string }>;
}) {
  const session = await requireUser("TEACHER");
  const { examId, submissionId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!exam || exam.teacherId !== session.sub) notFound();

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { student: true, answers: true },
  });
  if (!submission || submission.examId !== exam.id) notFound();

  const answersByQuestion = new Map(submission.answers.map((a) => [a.questionId, a.content as unknown as Block[]]));

  return (
    <div className="flex flex-1 flex-col bg-soft">
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-paper px-8">
        <Link
          href={`/teacher/exams/${exam.id}`}
          className="text-[13px] font-medium text-ink-2 hover:text-blue"
        >
          ← Retour
        </Link>
        <div className="h-6 w-px bg-line" />
        <Logo height={26} />
        <div className="flex flex-col">
          <span className="text-[15px] font-bold text-navy">{exam.title}</span>
          <span className="text-xs text-ink-3">
            {submission.student.name} — {submission.student.email}
          </span>
        </div>
        <div className="flex-1" />
        <a
          href={`/api/teacher/submissions/${submission.id}/pdf`}
          className="rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-white"
        >
          Télécharger en PDF
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        {exam.questions.map((q) => (
          <div key={q.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-6">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-blue">
                Question {q.order} — {q.points} points
              </span>
              <p className="text-[14.5px] leading-relaxed">{q.prompt}</p>
            </div>
            <AnswerBlocksView blocks={answersByQuestion.get(q.id) ?? []} />
          </div>
        ))}
      </main>
    </div>
  );
}
