import { useRef } from "react";
import { TextBlockData } from "@/lib/blocks";
import { BlockShell } from "./BlockShell";

export function TextBlock({
  block,
  onChange,
  onRemove,
}: {
  block: TextBlockData;
  onChange: (block: TextBlockData) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(marker: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = block.text.slice(start, end) || "texte";
    const next = block.text.slice(0, start) + marker + selected + marker + block.text.slice(end);
    onChange({ ...block, text: next });
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + marker.length;
      el.selectionEnd = start + marker.length + selected.length;
    });
  }

  function toggleListPrefix() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = block.text.slice(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    const selectedBlock = block.text.slice(lineStart, end || lineStart + 1);
    const lines = selectedBlock.split("\n").map((l) => (l.startsWith("- ") ? l : `- ${l}`));
    const next = block.text.slice(0, lineStart) + lines.join("\n") + block.text.slice(end);
    onChange({ ...block, text: next });
    requestAnimationFrame(() => el.focus());
  }

  return (
    <BlockShell label="Texte" onRemove={onRemove}>
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => wrapSelection("**")}
            className="h-7 w-7 rounded-md bg-soft text-sm font-bold text-ink-2 hover:bg-pale hover:text-blue"
            title="Gras"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => wrapSelection("*")}
            className="h-7 w-7 rounded-md bg-soft text-sm italic text-ink-2 hover:bg-pale hover:text-blue"
            title="Italique"
          >
            I
          </button>
          <button
            type="button"
            onClick={toggleListPrefix}
            className="h-7 rounded-md bg-soft px-2 text-xs font-medium text-ink-2 hover:bg-pale hover:text-blue"
            title="Liste à puces"
          >
            • Liste
          </button>
        </div>
        <textarea
          ref={ref}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Écrivez votre raisonnement ici… (** gras **, * italique *, - liste)"
          rows={4}
          className="w-full resize-y rounded-lg border border-line bg-soft p-3 text-[14.5px] leading-relaxed text-ink outline-none focus:border-blue"
        />
      </div>
    </BlockShell>
  );
}
