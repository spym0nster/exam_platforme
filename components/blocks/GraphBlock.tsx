"use client";

import { useRef } from "react";
import { DiagramBlockData, Point } from "@/lib/blocks";
import { BlockShell } from "./BlockShell";

const WIDTH = 320;
const HEIGHT = 200;

export function GraphBlock({
  block,
  onChange,
  onRemove,
}: {
  block: Extract<DiagramBlockData, { type: "graph" }>;
  onChange: (block: DiagramBlockData) => void;
  onRemove: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  function addPoint(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    onChange({ ...block, points: [...block.points, { x, y }] });
  }

  function undo() {
    onChange({ ...block, points: block.points.slice(0, -1) });
  }

  function clear() {
    onChange({ ...block, points: [] });
  }

  const path = block.points
    .map((p: Point, i: number) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <BlockShell label="Graphe" onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-3">
          Cliquez sur le repère pour placer les points de la courbe.
        </p>
        <div className="w-fit rounded-lg border border-line bg-soft p-2">
          <svg
            ref={svgRef}
            data-testid="graph-canvas"
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            onClick={addPoint}
            className="cursor-crosshair rounded bg-paper"
          >
            <line x1={0} y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="#D9E3EC" />
            <line x1={WIDTH / 2} y1={0} x2={WIDTH / 2} y2={HEIGHT} stroke="#D9E3EC" />
            {path && <path d={path} fill="none" stroke="#122A4D" strokeWidth={2.2} />}
            {block.points.map((p: Point, i: number) => (
              <circle key={i} cx={p.x} cy={p.y} r={3} fill="#298DCA" />
            ))}
          </svg>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={block.points.length === 0}
            className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-blue hover:text-blue disabled:opacity-40"
          >
            Annuler le dernier point
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={block.points.length === 0}
            className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-bad hover:text-bad disabled:opacity-40"
          >
            Effacer
          </button>
        </div>
      </div>
    </BlockShell>
  );
}
