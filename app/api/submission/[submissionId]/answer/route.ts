import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const answerSchema = z.object({
  questionId: z.string(),
  content: z.array(z.record(z.string(), z.unknown())),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { submissionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.studentId !== session.sub) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }
  if (submission.status === "SUBMITTED") {
    return NextResponse.json({ error: "Examen déjà soumis." }, { status: 409 });
  }

  const { questionId, content } = parsed.data;
  const jsonContent = content as unknown as Prisma.InputJsonValue;

  await prisma.answer.upsert({
    where: { submissionId_questionId: { submissionId, questionId } },
    update: { content: jsonContent },
    create: { submissionId, questionId, content: jsonContent },
  });

  return NextResponse.json({ ok: true });
}
