"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToolId, TOOL_IDS, TOOL_LABELS } from "@/lib/blocks";

type SubjectOption = { id: string; name: string; defaultTools: string[] };

export type QuestionDraft = { prompt: string; points: number; allowedTools: ToolId[] };

export type ExamFormInitial = {
  subjectId: string;
  title: string;
  durationMin: number;
  publish: boolean;
  questions: QuestionDraft[];
};

export function NewExamForm({
  subjects,
  examId,
  initial,
  locked = false,
}: {
  subjects: SubjectOption[];
  examId?: string;
  initial?: ExamFormInitial;
  locked?: boolean;
}) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [durationMin, setDurationMin] = useState(initial?.durationMin ?? 90);
  const [publish, setPublish] = useState(initial?.publish ?? true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultTools =
    (subjects.find((s) => s.id === subjectId)?.defaultTools as ToolId[]) ?? ["text"];

  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initial?.questions ?? [{ prompt: "", points: 5, allowedTools: defaultTools }]
  );

  function addQuestion() {
    setQuestions((qs) => [...qs, { prompt: "", points: 5, allowedTools: defaultTools }]);
  }

  function removeQuestion(i: number) {
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  }

  function updateQuestion(i: number, patch: Partial<QuestionDraft>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function toggleTool(i: number, tool: ToolId) {
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== i) return q;
        const has = q.allowedTools.includes(tool);
        return {
          ...q,
          allowedTools: has ? q.allowedTools.filter((t) => t !== tool) : [...q.allowedTools, tool],
        };
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(examId ? `/api/teacher/exams/${examId}` : "/api/teacher/exams", {
        method: examId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, title, durationMin, publish, questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      router.push(examId ? `/teacher/exams/${examId}` : "/teacher");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {locked && (
        <div className="rounded-lg border border-[#F5DCA0] bg-[#FFF7E6] px-4 py-3 text-sm text-[#8A5E00]">
          Des étudiants ont déjà commencé cet examen : la matière et les questions ne sont plus
          modifiables. Vous pouvez encore changer le titre, la durée et la publication.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-ink-2">Matière</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={locked}
            className="h-11 rounded-lg border border-line bg-paper px-3 text-sm disabled:opacity-60"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-ink-2">Titre</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Analyse — DS2 : Suites numériques"
            className="h-11 rounded-lg border border-line bg-paper px-3 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-ink-2">
            Durée (minutes)
          </label>
          <input
            type="number"
            min={1}
            required
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            className="h-11 w-32 rounded-lg border border-line bg-paper px-3 text-sm"
          />
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          Publier immédiatement (visible par les étudiants)
        </label>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Question {i + 1}</span>
              {questions.length > 1 && !locked && (
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="text-xs text-ink-3 hover:text-bad"
                >
                  Supprimer
                </button>
              )}
            </div>
            <textarea
              required
              disabled={locked}
              value={q.prompt}
              onChange={(e) => updateQuestion(i, { prompt: e.target.value })}
              placeholder="Énoncé de la question…"
              rows={2}
              className="w-full resize-y rounded-lg border border-line bg-soft p-3 text-sm disabled:opacity-60"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-ink-2">
                Points
                <input
                  type="number"
                  min={1}
                  disabled={locked}
                  value={q.points}
                  onChange={(e) => updateQuestion(i, { points: Number(e.target.value) })}
                  className="h-9 w-16 rounded-md border border-line px-2 disabled:opacity-60"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {TOOL_IDS.map((tool) => (
                  <button
                    key={tool}
                    type="button"
                    disabled={locked}
                    onClick={() => toggleTool(i, tool)}
                    className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-60 ${
                      q.allowedTools.includes(tool)
                        ? "bg-blue text-white"
                        : "bg-soft text-ink-2"
                    }`}
                  >
                    {TOOL_LABELS[tool]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {!locked && (
          <button
            type="button"
            onClick={addQuestion}
            className="w-fit rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 hover:border-blue hover:text-blue"
          >
            + Ajouter une question
          </button>
        )}
      </div>

      {error && <p className="text-sm text-bad">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-lg bg-blue px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Enregistrement…" : examId ? "Enregistrer les modifications" : "Créer l'examen"}
      </button>
    </form>
  );
}
