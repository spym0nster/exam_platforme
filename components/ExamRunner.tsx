"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { TextBlock } from "@/components/blocks/TextBlock";
import { EquationBlock } from "@/components/blocks/EquationBlock";
import { TableBlock } from "@/components/blocks/TableBlock";
import { GraphBlock } from "@/components/blocks/GraphBlock";
import { ShapesBlock } from "@/components/blocks/ShapesBlock";
import { ChartBlock } from "@/components/blocks/ChartBlock";
import { PseudocodeBlock } from "@/components/blocks/PseudocodeBlock";
import { NodeDiagramBlock } from "@/components/blocks/NodeDiagramBlock";
import { Block, ToolId, TOOL_LABELS, createBlock } from "@/lib/blocks";

export type ExamQuestion = {
  id: string;
  order: number;
  prompt: string;
  points: number;
  allowedTools: string[];
};

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export function ExamRunner({
  examTitle,
  submissionId,
  questions,
  initialAnswers,
  initialRemainingSeconds,
}: {
  examTitle: string;
  submissionId: string;
  questions: ExamQuestion[];
  initialAnswers: Record<string, Block[]>;
  initialRemainingSeconds: number;
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Block[]>>(initialAnswers);
  const [remaining, setRemaining] = useState(initialRemainingSeconds);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remaining === 0) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const saveAnswer = useCallback(
    (questionId: string, content: Block[]) => {
      setSaveState("saving");
      fetch(`/api/submission/${submissionId}/answer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, content }),
      })
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("idle"));
    },
    [submissionId]
  );

  function updateBlocks(questionId: string, blocks: Block[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: blocks }));
    clearTimeout(saveTimers.current[questionId]);
    saveTimers.current[questionId] = setTimeout(() => saveAnswer(questionId, blocks), 700);
  }

  function addBlock(tool: ToolId) {
    const blocks = answers[currentQuestion.id] ?? [];
    updateBlocks(currentQuestion.id, [...blocks, createBlock(tool)]);
  }

  function changeBlock(index: number, block: Block) {
    const blocks = [...(answers[currentQuestion.id] ?? [])];
    blocks[index] = block;
    updateBlocks(currentQuestion.id, blocks);
  }

  function removeBlock(index: number) {
    const blocks = (answers[currentQuestion.id] ?? []).filter((_, i) => i !== index);
    updateBlocks(currentQuestion.id, blocks);
  }

  async function handleSubmit() {
    setSubmitting(true);
    await fetch(`/api/submission/${submissionId}/submit`, { method: "POST" });
    router.push("/dashboard");
    router.refresh();
  }

  const blocks = answers[currentQuestion?.id ?? ""] ?? [];
  const totalAnswered = useMemo(
    () => Object.values(answers).filter((b) => b.length > 0).length,
    [answers]
  );

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-1 flex-col bg-soft">
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-line bg-paper px-7">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[13px] font-medium text-ink-2 hover:text-blue"
        >
          ← Quitter
        </button>
        <div className="h-6 w-px bg-line" />
        <Logo height={22} />
        <span className="text-[15px] font-bold text-navy">{examTitle}</span>
        <div className="flex-1" />
        <span className="text-xs text-ink-3">
          {saveState === "saving" && "Enregistrement…"}
          {saveState === "saved" && "Enregistré"}
        </span>
        <div className="flex items-center gap-2 rounded-lg border border-[#F5DCA0] bg-[#FFF7E6] px-3.5 py-1.5">
          <span className="text-xs font-semibold text-warn">TEMPS RESTANT</span>
          <span className="font-mono text-sm font-semibold text-[#8A5E00]">
            {formatTime(remaining)}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-lg bg-blue px-4.5 py-2 text-[13.5px] font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Envoi…" : "Soumettre l'examen"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[220px] shrink-0 border-r border-line bg-paper px-4.5 py-6">
          <div className="mb-1.5 px-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            Questions ({totalAnswered}/{questions.length} avec réponse)
          </div>
          <div className="flex flex-col gap-1">
            {questions.map((q, i) => {
              const active = i === currentIndex;
              const hasAnswer = (answers[q.id]?.length ?? 0) > 0;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13.5px] ${
                    active ? "bg-pale font-semibold text-blue" : "text-ink-2"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      active ? "bg-blue text-white" : hasAnswer ? "bg-good text-white" : "bg-line text-ink-3"
                    }`}
                  >
                    {q.order}
                  </span>
                  <span className="flex-1 truncate">Question {q.order}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-5 overflow-auto px-10 py-8">
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-paper px-6 py-5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue">
              Question {currentQuestion.order} — {currentQuestion.points} points
            </span>
            <p className="text-[15px] leading-relaxed">{currentQuestion.prompt}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper px-4 py-3">
            {currentQuestion.allowedTools.map((tool) => (
              <button
                key={tool}
                onClick={() => addBlock(tool as ToolId)}
                className="rounded-lg bg-soft px-4 py-2 text-[13px] font-semibold text-ink-2 hover:bg-pale hover:text-blue"
              >
                + {TOOL_LABELS[tool as ToolId]}
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-xs text-ink-3">
              Outils autorisés : {currentQuestion.allowedTools.map((t) => TOOL_LABELS[t as ToolId]).join(", ")}
            </span>
          </div>

          <div className="flex min-h-[360px] flex-col gap-4 rounded-xl border border-line bg-paper p-7">
            {blocks.length === 0 && (
              <p className="text-sm text-ink-3">
                Utilisez les boutons ci-dessus pour insérer un bloc de réponse (texte, équation,
                tableau, graphe…).
              </p>
            )}
            {blocks.map((block, i) => {
              switch (block.type) {
                case "text":
                  return (
                    <TextBlock
                      key={block.id}
                      block={block}
                      onChange={(b) => changeBlock(i, b)}
                      onRemove={() => removeBlock(i)}
                    />
                  );
                case "equation":
                  return (
                    <EquationBlock
                      key={block.id}
                      block={block}
                      onChange={(b) => changeBlock(i, b)}
                      onRemove={() => removeBlock(i)}
                    />
                  );
                case "table":
                  return (
                    <TableBlock
                      key={block.id}
                      block={block}
                      onChange={(b) => changeBlock(i, b)}
                      onRemove={() => removeBlock(i)}
                    />
                  );
                case "graph":
                  return (
                    <GraphBlock
                      key={block.id}
                      block={block}
                      onChange={(b) => changeBlock(i, b)}
                      onRemove={() => removeBlock(i)}
                    />
                  );
                case "shapes":
                  return (
                    <ShapesBlock
                      key={block.id}
                      block={block}
                      onChange={(b) => changeBlock(i, b)}
                      onRemove={() => removeBlock(i)}
                    />
                  );
                case "chart":
                  return (
                    <ChartBlock
                      key={block.id}
                      block={block}
                      onChange={(b) => changeBlock(i, b)}
                      onRemove={() => removeBlock(i)}
                    />
                  );
                case "pseudocode":
                  return (
                    <PseudocodeBlock
                      key={block.id}
                      block={block}
                      onChange={(b) => changeBlock(i, b)}
                      onRemove={() => removeBlock(i)}
                    />
                  );
                case "flowchart":
                case "circuit":
                  return (
                    <NodeDiagramBlock
                      key={block.id}
                      block={block}
                      onChange={(b) => changeBlock(i, b)}
                      onRemove={() => removeBlock(i)}
                    />
                  );
              }
            })}
          </div>

          <div className="flex justify-between pb-4">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 disabled:opacity-40"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
