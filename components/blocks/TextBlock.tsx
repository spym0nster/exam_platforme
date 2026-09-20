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
  return (
    <BlockShell label="Texte" onRemove={onRemove}>
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Écrivez votre raisonnement ici…"
        rows={4}
        className="w-full resize-y rounded-lg border border-line bg-soft p-3 text-[14.5px] leading-relaxed text-ink outline-none focus:border-blue"
      />
    </BlockShell>
  );
}
