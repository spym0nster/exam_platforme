import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { NewExamForm } from "@/components/NewExamForm";
import type { ToolId } from "@/lib/blocks";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await requireUser("TEACHER");
  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { submissions: true } },
    },
  });
  if (!exam || exam.teacherId !== session.sub) notFound();

  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-1 flex-col bg-soft">
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-paper px-8">
        <Link href={`/teacher/exams/${exam.id}`} className="text-[13px] font-medium text-ink-2 hover:text-blue">
          ← Retour
        </Link>
        <div className="h-6 w-px bg-line" />
        <Logo height={26} />
        <span className="text-[15px] font-bold text-navy">Modifier l&apos;examen</span>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <NewExamForm
          examId={exam.id}
          locked={exam._count.submissions > 0}
          subjects={subjects.map((s) => ({ id: s.id, name: s.name, defaultTools: s.defaultTools }))}
          initial={{
            subjectId: exam.subjectId,
            title: exam.title,
            durationMin: exam.durationMin,
            publish: exam.status === "PUBLISHED",
            questions: exam.questions.map((q) => ({
              prompt: q.prompt,
              points: q.points,
              allowedTools: q.allowedTools as ToolId[],
            })),
          }}
        />
      </main>
    </div>
  );
}
