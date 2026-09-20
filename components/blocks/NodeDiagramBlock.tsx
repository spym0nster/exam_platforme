"use client";

import { useRef, useState } from "react";
import { CIRCUIT_KINDS, DiagramNode, FLOWCHART_KINDS, NodeDiagramBlockData } from "@/lib/blocks";
import { BlockShell } from "./BlockShell";
import { NodeShapeView } from "./DiagramShapes";

const WIDTH = 480;
const HEIGHT = 260;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function NodeDiagramBlock({
  block,
  onChange,
  onRemove,
}: {
  block: NodeDiagramBlockData;
  onChange: (block: NodeDiagramBlockData) => void;
  onRemove: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const kinds = block.type === "flowchart" ? FLOWCHART_KINDS : CIRCUIT_KINDS;
  const [currentKind, setCurrentKind] = useState(kinds[0].id);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function toSvgPoint(e: React.MouseEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }

  function placeNode(e: React.MouseEvent<SVGSVGElement>) {
    if (connectMode) return;
    const { x, y } = toSvgPoint(e);
    const kindDef = kinds.find((k) => k.id === currentKind)!;
    const node: DiagramNode = { id: uid(), kind: currentKind, x, y, label: kindDef.label };
    onChange({ ...block, nodes: [...block.nodes, node] });
  }

  function clickNode(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation();
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(nodeId);
      } else if (connectFrom !== nodeId) {
        onChange({ ...block, edges: [...block.edges, { id: uid(), from: connectFrom, to: nodeId }] });
        setConnectFrom(null);
        setConnectMode(false);
      }
    } else {
      setSelectedId(nodeId);
    }
  }

  function updateLabel(label: string) {
    onChange({
      ...block,
      nodes: block.nodes.map((n) => (n.id === selectedId ? { ...n, label } : n)),
    });
  }

  function deleteSelected() {
    onChange({
      ...block,
      nodes: block.nodes.filter((n) => n.id !== selectedId),
      edges: block.edges.filter((ed) => ed.from !== selectedId && ed.to !== selectedId),
    });
    setSelectedId(null);
  }

  function clearAll() {
    onChange({ ...block, nodes: [], edges: [] });
    setSelectedId(null);
    setConnectFrom(null);
    setConnectMode(false);
  }

  const selectedNode = block.nodes.find((n) => n.id === selectedId) ?? null;
  const nodeById = new Map(block.nodes.map((n) => [n.id, n]));

  return (
    <BlockShell label={block.type === "flowchart" ? "Organigramme" : "Circuit logique"} onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                setCurrentKind(k.id);
                setConnectMode(false);
              }}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                !connectMode && currentKind === k.id ? "bg-blue text-white" : "bg-soft text-ink-2"
              }`}
            >
              {k.label}
            </button>
          ))}
          <div className="h-5 w-px bg-line" />
          <button
            type="button"
            onClick={() => {
              setConnectMode((v) => !v);
              setConnectFrom(null);
            }}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
              connectMode ? "bg-navy text-white" : "bg-soft text-ink-2"
            }`}
          >
            {connectMode ? "Cliquez 2 nœuds à relier…" : "Relier"}
          </button>
        </div>

        <p className="text-xs text-ink-3">
          Cliquez sur la zone pour placer un nœud du type sélectionné. Utilisez « Relier » puis cliquez deux
          nœuds pour les connecter.
        </p>

        <div className="w-fit rounded-lg border border-line bg-soft p-2">
          <svg
            ref={svgRef}
            data-testid="diagram-canvas"
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            onClick={placeNode}
            className="cursor-crosshair rounded bg-paper"
          >
            <defs>
              <marker id={`arrow-${block.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#122A4D" />
              </marker>
            </defs>
            {block.edges.map((edge) => {
              const from = nodeById.get(edge.from);
              const to = nodeById.get(edge.to);
              if (!from || !to) return null;
              return (
                <line
                  key={edge.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#122A4D"
                  strokeWidth={1.8}
                  markerEnd={block.type === "flowchart" ? `url(#arrow-${block.id})` : undefined}
                />
              );
            })}
            {block.nodes.map((node) => (
              <g key={node.id} onClick={(e) => clickNode(e, node.id)} className="cursor-pointer">
                <NodeShapeView node={node} selected={node.id === selectedId || node.id === connectFrom} variant={block.type} />
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center gap-2">
          {selectedNode && (
            <>
              <input
                value={selectedNode.label}
                onChange={(e) => updateLabel(e.target.value)}
                className="h-8 w-48 rounded-md border border-line px-2 text-sm outline-none focus:border-blue"
              />
              <button
                type="button"
                onClick={deleteSelected}
                className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-bad hover:text-bad"
              >
                Supprimer ce nœud
              </button>
            </>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={clearAll}
            disabled={block.nodes.length === 0}
            className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-bad hover:text-bad disabled:opacity-40"
          >
            Effacer tout
          </button>
        </div>
      </div>
    </BlockShell>
  );
}
