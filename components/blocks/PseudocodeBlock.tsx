import { useRef } from "react";
import { PseudocodeBlockData } from "@/lib/blocks";
import { BlockShell } from "./BlockShell";

const KEYWORDS = [
  "Début",
  "Fin",
  "Variables",
  "Lire",
  "Afficher",
  "Si ... Alors",
  "Sinon",
  "FinSi",
  "Pour ... Faire",
  "FinPour",
  "TantQue ... Faire",
  "FinTantQue",
];

export function PseudocodeBlock({
  block,
  onChange,
  onRemove,
}: {
  block: PseudocodeBlockData;
  onChange: (block: PseudocodeBlockData) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insert(keyword: string) {
    const el = ref.current;
    const line = keyword + "\n";
    if (!el) {
      onChange({ ...block, code: block.code + line });
      return;
    }
    const start = el.selectionStart ?? block.code.length;
    const end = el.selectionEnd ?? block.code.length;
    const next = block.code.slice(0, start) + line + block.code.slice(end);
    onChange({ ...block, code: next });
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + line.length;
    });
  }

  return (
    <BlockShell label="Pseudocode" onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {KEYWORDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => insert(k)}
              className="rounded-md bg-soft px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-pale hover:text-blue"
            >
              {k}
            </button>
          ))}
        </div>
        <textarea
          ref={ref}
          value={block.code}
          onChange={(e) => onChange({ ...block, code: e.target.value })}
          placeholder="Début&#10;  Lire n&#10;  ...&#10;Fin"
          rows={8}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-line bg-soft p-3 font-mono text-[13.5px] leading-relaxed text-ink outline-none focus:border-blue"
        />
      </div>
    </BlockShell>
  );
}
