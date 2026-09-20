import katex from "katex";
import type { Block, DiagramEdge, DiagramNode } from "@/lib/blocks";
import { BarChart, PieChart } from "@/components/blocks/ChartBlock";
import { NodeShapeView } from "@/components/blocks/DiagramShapes";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { GRAPH_WIDTH, GRAPH_HEIGHT, buildGraphGrid } from "@/lib/graph-grid";

const { lines: GRID_LINES, labels: GRID_LABELS } = buildGraphGrid();

function EquationView({ latex }: { latex: string }) {
  let html = "";
  let error = false;
  try {
    html = latex.trim() ? katex.renderToString(latex, { throwOnError: true }) : "";
  } catch {
    error = true;
  }
  if (error) {
    return <span className="text-sm text-bad">Formule invalide.</span>;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function GraphView({ points }: { points: { x: number; y: number }[] }) {
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  return (
    <svg
      width={GRAPH_WIDTH}
      height={GRAPH_HEIGHT}
      viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
      className="rounded border border-line bg-soft"
    >
      {GRID_LINES.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.axis ? "#B9C7D6" : "#EAF4FA"} strokeWidth={l.axis ? 1.4 : 1} />
      ))}
      {GRID_LABELS.map((l, i) => (
        <text key={i} x={l.x} y={l.y} fontSize={8} textAnchor="middle" fill="#8290A3">
          {l.text}
        </text>
      ))}
      {path && <path d={path} fill="none" stroke="#122A4D" strokeWidth={2.2} />}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#298DCA" />
      ))}
    </svg>
  );
}

function ShapesView({ shapes }: { shapes: import("@/lib/blocks").Shape[] }) {
  return (
    <svg width={320} height={200} viewBox="0 0 320 200" className="rounded border border-line bg-soft">
      {shapes.map((s) => {
        if (s.kind === "rect") {
          return (
            <rect
              key={s.id}
              x={Math.min(s.x1, s.x2)}
              y={Math.min(s.y1, s.y2)}
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
          return <circle key={s.id} cx={cx} cy={cy} r={r} fill="none" stroke="#122A4D" strokeWidth={2} />;
        }
        return (
          <line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#122A4D" strokeWidth={2} />
        );
      })}
    </svg>
  );
}

function NodeDiagramView({
  nodes,
  edges,
  variant,
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  variant: "flowchart" | "circuit";
}) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (
    <svg width={480} height={260} viewBox="0 0 480 260" className="rounded border border-line bg-soft">
      {edges.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        return <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#122A4D" strokeWidth={1.8} />;
      })}
      {nodes.map((node) => (
        <g key={node.id}>
          <NodeShapeView node={node} variant={variant} />
        </g>
      ))}
    </svg>
  );
}

const BLOCK_TITLES: Record<Block["type"], string> = {
  text: "Texte",
  equation: "Équation",
  table: "Tableau",
  graph: "Graphe",
  shapes: "Formes",
  chart: "Graphique",
  pseudocode: "Pseudocode",
  flowchart: "Organigramme",
  circuit: "Circuit logique",
};

export function BlockView({ block }: { block: Block }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-paper p-4">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-3">
        {BLOCK_TITLES[block.type]}
      </span>
      {block.type === "text" && (
        <div
          className="text-[14.5px] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: block.text ? renderMarkdownLite(block.text) : "—" }}
        />
      )}
      {block.type === "equation" && (
        <div className="rounded-md bg-pale px-4 py-3 text-[16px] text-navy-2">
          <EquationView latex={block.latex} />
        </div>
      )}
      {block.type === "table" && (
        <table className="border-collapse text-sm">
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-line px-3 py-1.5 text-center">
                    {cell || " "}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {block.type === "graph" && <GraphView points={block.points} />}
      {block.type === "shapes" && <ShapesView shapes={block.shapes} />}
      {block.type === "chart" &&
        (block.kind === "bar" ? <BarChart data={block.data} /> : <PieChart data={block.data} />)}
      {block.type === "pseudocode" && (
        <pre className="whitespace-pre-wrap rounded-md bg-soft p-3 font-mono text-[13px] leading-relaxed">
          {block.code || "—"}
        </pre>
      )}
      {(block.type === "flowchart" || block.type === "circuit") && (
        <NodeDiagramView nodes={block.nodes} edges={block.edges} variant={block.type} />
      )}
    </div>
  );
}

export function AnswerBlocksView({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return <p className="text-sm text-ink-3">Aucune réponse fournie.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}
