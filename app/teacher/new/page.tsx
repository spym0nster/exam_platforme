import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { NewExamForm } from "@/components/NewExamForm";

export default async function NewExamPage() {
  await requireUser("TEACHER");
  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-1 flex-col bg-soft">
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-paper px-8">
        <Link href="/teacher" className="text-[13px] font-medium text-ink-2 hover:text-blue">
          ← Retour
        </Link>
        <div className="h-6 w-px bg-line" />
        <Logo height={26} />
        <span className="text-[15px] font-bold text-navy">Créer un examen</span>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <NewExamForm
          subjects={subjects.map((s) => ({ id: s.id, name: s.name, defaultTools: s.defaultTools }))}
        />
      </main>
    </div>
  );
}
