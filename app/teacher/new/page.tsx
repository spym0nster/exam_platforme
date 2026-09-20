import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { NewExamForm, ExamFormInitial } from "@/components/NewExamForm";
import type { ToolId } from "@/lib/blocks";

export default async function NewExamPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicate?: string }>;
}) {
  const session = await requireUser("TEACHER");
  const { duplicate } = await searchParams;

  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" } });

  let initial: ExamFormInitial | undefined;
  if (duplicate) {
    const source = await prisma.exam.findUnique({
      where: { id: duplicate },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (source && source.teacherId === session.sub) {
      initial = {
        subjectId: source.subjectId,
        title: `${source.title} (copie)`,
        durationMin: source.durationMin,
        publish: false,
        questions: source.questions.map((q) => ({
          prompt: q.prompt,
          points: q.points,
          allowedTools: q.allowedTools as ToolId[],
        })),
      };
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-soft">
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-paper px-8">
        <Link href="/teacher" className="text-[13px] font-medium text-ink-2 hover:text-blue">
          ← Retour
        </Link>
        <div className="h-6 w-px bg-line" />
        <Logo height={26} />
        <span className="text-[15px] font-bold text-navy">
          {initial ? "Dupliquer / Importer un examen" : "Créer un examen"}
        </span>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <NewExamForm
          subjects={subjects.map((s) => ({ id: s.id, name: s.name, defaultTools: s.defaultTools }))}
          initial={initial}
        />
      </main>
    </div>
  );
}
