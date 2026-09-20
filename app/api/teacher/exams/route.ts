import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const toolEnum = z.enum(["text", "equation", "table", "graph", "shapes"]);

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

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = examSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", issues: parsed.error.issues }, { status: 400 });
  }

  const { subjectId, title, durationMin, publish, questions } = parsed.data;

  const exam = await prisma.exam.create({
    data: {
      subjectId,
      teacherId: session.sub,
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
  });

  return NextResponse.json({ ok: true, examId: exam.id });
}
