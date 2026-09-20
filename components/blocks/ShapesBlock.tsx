"use client";

import { useRef, useState } from "react";
import { DiagramBlockData, Shape } from "@/lib/blocks";
import { BlockShell } from "./BlockShell";

const WIDTH = 320;
const HEIGHT = 200;
const KINDS: { id: Shape["kind"]; label: string }[] = [
  { id: "rect", label: "Rectangle" },
  { id: "circle", label: "Cercle" },
  { id: "line", label: "Ligne" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function ShapesBlock({
  block,
  onChange,
  onRemove,
}: {
  block: Extract<DiagramBlockData, { type: "shapes" }>;
  onChange: (block: DiagramBlockData) => void;
  onRemove: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [kind, setKind] = useState<Shape["kind"]>("rect");
  const [draft, setDraft] = useState<Shape | null>(null);

  function toSvgPoint(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    const { x, y } = toSvgPoint(e);
    setDraft({ id: uid(), kind, x1: x, y1: y, x2: x, y2: y });
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!draft) return;
    const { x, y } = toSvgPoint(e);
    setDraft({ ...draft, x2: x, y2: y });
  }

  function onPointerUp() {
    if (draft) {
      onChange({ ...block, shapes: [...block.shapes, draft] });
      setDraft(null);
    }
  }

  function clear() {
    onChange({ ...block, shapes: [] });
  }

  function renderShape(s: Shape, key: React.Key) {
    if (s.kind === "rect") {
      const x = Math.min(s.x1, s.x2);
      const y = Math.min(s.y1, s.y2);
      return (
        <rect
          key={key}
          x={x}
          y={y}
          width={Math.abs(s.x2 - s.x1)}
          height={Math.abs(s.y2 - s.y1)}
          fill="none"
          stroke="#122A4D"
          strokeWidth={2}
        />
      );
    }
    if (s.kind === "circle") {
      const cx = (s.x1 + s.x2) / 2;
      const cy = (s.y1 + s.y2) / 2;
      const r = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) / 2;
      return <circle key={key} cx={cx} cy={cy} r={r} fill="none" stroke="#122A4D" strokeWidth={2} />;
    }
    return (
      <line
        key={key}
        x1={s.x1}
        y1={s.y1}
        x2={s.x2}
        y2={s.y2}
        stroke="#122A4D"
        strokeWidth={2}
      />
    );
  }

  return (
    <BlockShell label="Formes" onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                kind === k.id ? "bg-blue text-white" : "bg-soft text-ink-2"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-3">Cliquez-glissez sur la zone pour dessiner la forme.</p>
        <div className="w-fit rounded-lg border border-line bg-soft p-2">
          <svg
            ref={svgRef}
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="cursor-crosshair touch-none rounded bg-paper"
          >
            {block.shapes.map((s, i) => renderShape(s, i))}
            {draft && renderShape(draft, "draft")}
          </svg>
        </div>
        <button
          type="button"
          onClick={clear}
          disabled={block.shapes.length === 0}
          className="w-fit rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-bad hover:text-bad disabled:opacity-40"
        >
          Effacer tout
        </button>
      </div>
    </BlockShell>
  );
}
