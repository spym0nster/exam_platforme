import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExamRunner } from "@/components/ExamRunner";
import type { Block } from "@/lib/blocks";

function computeRemainingSeconds(startedAt: Date, durationMin: number) {
  const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  return Math.max(0, durationMin * 60 - elapsedSeconds);
}

export default async function ExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await requireUser("STUDENT");
  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!exam || exam.status !== "PUBLISHED") notFound();

  let submission = await prisma.submission.findUnique({
    where: { examId_studentId: { examId: exam.id, studentId: session.sub } },
    include: { answers: true },
  });

  if (!submission) {
    submission = await prisma.submission.create({
      data: { examId: exam.id, studentId: session.sub },
      include: { answers: true },
    });
  }

  if (submission.status === "SUBMITTED") {
    return (
      <div className="flex flex-1 items-center justify-center bg-soft p-6">
        <div className="max-w-md rounded-2xl border border-line bg-paper p-10 text-center">
          <h1 className="mb-2 text-2xl font-extrabold text-navy">Copie déjà soumise</h1>
          <p className="text-sm text-ink-2">
            Vous avez déjà soumis votre copie pour cet examen
            {submission.submittedAt
              ? ` le ${submission.submittedAt.toLocaleString("fr-FR")}`
              : ""}
            .
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-blue px-5 py-2.5 text-sm font-semibold text-white"
          >
            Retour au tableau de bord
          </a>
        </div>
      </div>
    );
  }

  const initialAnswers: Record<string, Block[]> = {};
  for (const q of exam.questions) {
    const existing = submission.answers.find((a) => a.questionId === q.id);
    initialAnswers[q.id] = (existing?.content as unknown as Block[]) ?? [];
  }

  const remainingSeconds = computeRemainingSeconds(submission.startedAt, exam.durationMin);

  return (
    <ExamRunner
      examTitle={exam.title}
      submissionId={submission.id}
      questions={exam.questions.map((q) => ({
        id: q.id,
        order: q.order,
        prompt: q.prompt,
        points: q.points,
        allowedTools: q.allowedTools,
      }))}
      initialAnswers={initialAnswers}
      initialRemainingSeconds={remainingSeconds}
    />
  );
}
