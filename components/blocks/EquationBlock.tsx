"use client";

import { useMemo } from "react";
import katex from "katex";
import { EquationBlockData } from "@/lib/blocks";
import { BlockShell } from "./BlockShell";

export function EquationBlock({
  block,
  onChange,
  onRemove,
}: {
  block: EquationBlockData;
  onChange: (block: EquationBlockData) => void;
  onRemove: () => void;
}) {
  const rendered = useMemo(() => {
    if (!block.latex.trim()) return { html: "", error: false };
    try {
      return { html: katex.renderToString(block.latex, { throwOnError: true }), error: false };
    } catch {
      return { html: "", error: true };
    }
  }, [block.latex]);

  return (
    <BlockShell label="Équation" onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <input
          value={block.latex}
          onChange={(e) => onChange({ ...block, latex: e.target.value })}
          placeholder="Notation LaTeX, ex : f'(x) = 3/(x+1)^2"
          className="w-full rounded-lg border border-line bg-soft px-3 py-2 font-mono text-sm text-ink outline-none focus:border-blue"
        />
        <div className="min-h-[52px] rounded-lg border border-line bg-pale px-4 py-3 text-[17px] text-navy-2">
          {rendered.error && (
            <span className="text-sm text-bad">Formule invalide — vérifiez la syntaxe LaTeX.</span>
          )}
          {!rendered.error && rendered.html && (
            <span dangerouslySetInnerHTML={{ __html: rendered.html }} />
          )}
          {!rendered.error && !rendered.html && (
            <span className="text-sm text-ink-3">L&apos;aperçu de la formule s&apos;affichera ici.</span>
          )}
        </div>
      </div>
    </BlockShell>
  );
}
