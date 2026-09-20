import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { renderSubmissionHtml } from "@/lib/submission-pdf";
import type { Block } from "@/lib/blocks";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: true,
      answers: true,
      exam: { include: { subject: true, questions: { orderBy: { order: "asc" } } } },
    },
  });

  if (!submission || submission.exam.teacherId !== session.sub) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const answersByQuestion = new Map(submission.answers.map((a) => [a.questionId, a.content as unknown as Block[]]));

  const html = renderSubmissionHtml({
    examTitle: submission.exam.title,
    subjectName: submission.exam.subject.name,
    studentName: submission.student.name,
    studentEmail: submission.student.email,
    submittedAt: submission.submittedAt ? submission.submittedAt.toLocaleString("fr-FR") : null,
    questions: submission.exam.questions.map((q) => ({
      order: q.order,
      prompt: q.prompt,
      points: q.points,
      blocks: answersByQuestion.get(q.id) ?? [],
    })),
  });

  const browser = await chromium.launch(
    process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}
  );
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="copie-${submission.student.name.replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
