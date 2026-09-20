import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TOOL_IDS } from "@/lib/blocks";

const toolEnum = z.enum(TOOL_IDS);

const examSchema = z.object({
  subjectId: z.string(),
  title: z.string().min(3),
  durationMin: z.number().int().positive(),
  publish: z.boolean(),
  questions: z
    .array(
      z.object({
        prompt: z.string().min(3),
        points: z.number().int().positive(),
        allowedTools: z.array(toolEnum).min(1),
      })
    )
    .min(1),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { examId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = examSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", issues: parsed.error.issues }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { _count: { select: { submissions: true } } },
  });
  if (!exam || exam.teacherId !== session.sub) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const { subjectId, title, durationMin, publish, questions } = parsed.data;
  const hasSubmissions = exam._count.submissions > 0;

  if (hasSubmissions) {
    // Une fois que des étudiants ont commencé, la structure des questions ne change plus.
    await prisma.exam.update({
      where: { id: examId },
      data: { title, durationMin, status: publish ? "PUBLISHED" : "DRAFT" },
    });
  } else {
    await prisma.$transaction([
      prisma.question.deleteMany({ where: { examId } }),
      prisma.exam.update({
        where: { id: examId },
        data: {
          subjectId,
          title,
          durationMin,
          status: publish ? "PUBLISHED" : "DRAFT",
          questions: {
            create: questions.map((q, i) => ({
              order: i + 1,
              prompt: q.prompt,
              points: q.points,
              allowedTools: q.allowedTools,
            })),
          },
        },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
