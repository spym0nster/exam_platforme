import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.studentId !== session.sub) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  if (submission.status !== "SUBMITTED") {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
