import type { Block, DiagramEdge, DiagramNode } from "@/lib/blocks";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { GRAPH_WIDTH, GRAPH_HEIGHT, buildGraphGrid } from "@/lib/graph-grid";

const { lines: GRID_LINES, labels: GRID_LABELS } = buildGraphGrid();

const BLOCK_TITLES: Record<Block["type"], string> = {
  text: "Texte",
  equation: "Équation (LaTeX)",
  table: "Tableau",
  graph: "Graphe",
  shapes: "Formes",
  chart: "Graphique",
  pseudocode: "Pseudocode",
  flowchart: "Organigramme",
  circuit: "Circuit logique",
};

const COLORS = ["#298DCA", "#F5B335", "#1E7A4D", "#122A4D", "#B8801A", "#0B4F86"];

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svgGraph(points: { x: number; y: number }[]) {
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const circles = points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#298DCA"/>`).join("");
  const grid = GRID_LINES.map(
    (l) => `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="${l.axis ? "#B9C7D6" : "#EAF4FA"}" stroke-width="${l.axis ? 1.4 : 1}"/>`
  ).join("");
  const labels = GRID_LABELS.map(
    (l) => `<text x="${l.x}" y="${l.y}" font-size="8" text-anchor="middle" fill="#8290A3">${l.text}</text>`
  ).join("");
  return `<svg width="${GRAPH_WIDTH}" height="${GRAPH_HEIGHT}" viewBox="0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}" style="background:#F4F7FA;border-radius:6px">
    ${grid}${labels}
    ${path ? `<path d="${path}" fill="none" stroke="#122A4D" stroke-width="2.2"/>` : ""}
    ${circles}
  </svg>`;
}

function svgShapes(shapes: { id: string; kind: string; x1: number; y1: number; x2: number; y2: number }[]) {
  const items = shapes
    .map((s) => {
      if (s.kind === "rect") {
        const x = Math.min(s.x1, s.x2);
        const y = Math.min(s.y1, s.y2);
        return `<rect x="${x}" y="${y}" width="${Math.abs(s.x2 - s.x1)}" height="${Math.abs(s.y2 - s.y1)}" fill="none" stroke="#122A4D" stroke-width="2"/>`;
      }
      if (s.kind === "circle") {
        const cx = (s.x1 + s.x2) / 2;
        const cy = (s.y1 + s.y2) / 2;
        const r = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) / 2;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#122A4D" stroke-width="2"/>`;
      }
      return `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#122A4D" stroke-width="2"/>`;
    })
    .join("");
  return `<svg width="320" height="200" viewBox="0 0 320 200" style="background:#F4F7FA;border-radius:6px">${items}</svg>`;
}

function svgBarChart(data: { label: string; value: number }[]) {
  const WIDTH = 320;
  const HEIGHT = 200;
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = data.length ? (WIDTH - 20) / data.length : 0;
  const bars = data
    .map((d, i) => {
      const h = ((HEIGHT - 40) * d.value) / max;
      const x = 10 + i * barWidth + barWidth * 0.15;
      const w = barWidth * 0.7;
      const y = HEIGHT - 20 - h;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${COLORS[i % COLORS.length]}" rx="3"/>
        <text x="${x + w / 2}" y="${HEIGHT - 6}" font-size="10" text-anchor="middle" fill="#53637A">${esc(d.label)}</text>`;
    })
    .join("");
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" style="background:#fff">
    <line x1="10" y1="${HEIGHT - 20}" x2="${WIDTH - 10}" y2="${HEIGHT - 20}" stroke="#D9E3EC"/>${bars}
  </svg>`;
}

function svgPieChart(data: { label: string; value: number }[]) {
  const SIZE = 200;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE / 2 - 10;
  let angle = -Math.PI / 2;
  const slices = data
    .map((d, i) => {
      const frac = d.value / total;
      const start = angle;
      const end = angle + frac * 2 * Math.PI;
      angle = end;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const largeArc = end - start > Math.PI ? 1 : 0;
      return `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${COLORS[i % COLORS.length]}"/>`;
    })
    .join("");
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" style="background:#fff">${slices}</svg>`;
}

function nodeShape(node: DiagramNode, variant: "flowchart" | "circuit") {
  const label = `<text x="${node.x}" y="${node.y + 4}" font-size="11" text-anchor="middle" fill="#16233A">${esc(node.label)}</text>`;
  const BOX_W = 96;
  const BOX_H = 40;
  if (variant === "flowchart") {
    if (node.kind === "start-end") {
      return `<ellipse cx="${node.x}" cy="${node.y}" rx="${BOX_W / 2}" ry="${BOX_H / 2}" fill="#fff" stroke="#122A4D" stroke-width="2"/>${label}`;
    }
    if (node.kind === "decision") {
      const w = BOX_W / 2;
      const h = BOX_H / 2 + 8;
      const points = `${node.x},${node.y - h} ${node.x + w},${node.y} ${node.x},${node.y + h} ${node.x - w},${node.y}`;
      return `<polygon points="${points}" fill="#fff" stroke="#122A4D" stroke-width="2"/>${label}`;
    }
    if (node.kind === "io") {
      const w = BOX_W / 2;
      const h = BOX_H / 2;
      const skew = 12;
      const points = `${node.x - w + skew},${node.y - h} ${node.x + w},${node.y - h} ${node.x + w - skew},${node.y + h} ${node.x - w},${node.y + h}`;
      return `<polygon points="${points}" fill="#fff" stroke="#122A4D" stroke-width="2"/>${label}`;
    }
    return `<rect x="${node.x - BOX_W / 2}" y="${node.y - BOX_H / 2}" width="${BOX_W}" height="${BOX_H}" fill="#fff" stroke="#122A4D" stroke-width="2" rx="4"/>${label}`;
  }
  if (node.kind === "input" || node.kind === "output") {
    return `<circle cx="${node.x}" cy="${node.y}" r="20" fill="#fff" stroke="#122A4D" stroke-width="2"/>${label}`;
  }
  return `<rect x="${node.x - BOX_W / 2}" y="${node.y - BOX_H / 2}" width="${BOX_W}" height="${BOX_H}" fill="#fff" stroke="#122A4D" stroke-width="2" rx="6"/>${label}`;
}

function svgNodeDiagram(nodes: DiagramNode[], edges: DiagramEdge[], variant: "flowchart" | "circuit") {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const lines = edges
    .map((e) => {
      const from = byId.get(e.from);
      const to = byId.get(e.to);
      if (!from || !to) return "";
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#122A4D" stroke-width="1.8"/>`;
    })
    .join("");
  const shapes = nodes.map((n) => nodeShape(n, variant)).join("");
  return `<svg width="480" height="260" viewBox="0 0 480 260" style="background:#F4F7FA;border-radius:6px">${lines}${shapes}</svg>`;
}

function renderBlock(block: Block): string {
  const title = BLOCK_TITLES[block.type];
  const wrap = (inner: string) =>
    `<div style="border:1px solid #D9E3EC;border-radius:8px;padding:14px;margin-bottom:10px;">
      <div style="font-size:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#8290A3;margin-bottom:6px;">${title}</div>
      ${inner}
    </div>`;

  switch (block.type) {
    case "text":
      return wrap(
        `<div style="font-size:13.5px;line-height:1.6;">${block.text ? renderMarkdownLite(block.text) : "—"}</div>`
      );
    case "equation":
      return wrap(
        `<div style="background:#EAF4FA;border-radius:6px;padding:10px 14px;font-family:monospace;font-size:14px;color:#0B4F86;">${esc(block.latex) || "—"}</div>`
      );
    case "table": {
      const rows = block.rows
        .map(
          (row) =>
            `<tr>${row
              .map((cell) => `<td style="border:1px solid #D9E3EC;padding:6px 10px;text-align:center;">${esc(cell) || "&nbsp;"}</td>`)
              .join("")}</tr>`
        )
        .join("");
      return wrap(`<table style="border-collapse:collapse;font-size:12.5px;">${rows}</table>`);
    }
    case "graph":
      return wrap(svgGraph(block.points));
    case "shapes":
      return wrap(svgShapes(block.shapes));
    case "chart":
      return wrap(block.kind === "bar" ? svgBarChart(block.data) : svgPieChart(block.data));
    case "pseudocode":
      return wrap(
        `<pre style="white-space:pre-wrap;font-family:monospace;font-size:12.5px;background:#F4F7FA;padding:10px;border-radius:6px;margin:0;">${esc(block.code) || "—"}</pre>`
      );
    case "flowchart":
    case "circuit":
      return wrap(svgNodeDiagram(block.nodes, block.edges, block.type));
  }
}

export type PdfQuestion = { order: number; prompt: string; points: number; blocks: Block[] };

export function renderSubmissionHtml(data: {
  examTitle: string;
  subjectName: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string | null;
  questions: PdfQuestion[];
}) {
  const questionsHtml = data.questions
    .map(
      (q) => `
      <section style="margin-bottom:22px;page-break-inside:avoid;">
        <div style="font-size:11px;font-weight:700;color:#298DCA;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">
          Question ${q.order} — ${q.points} points
        </div>
        <p style="font-size:13.5px;line-height:1.6;margin:0 0 10px;">${esc(q.prompt)}</p>
        ${q.blocks.length ? q.blocks.map(renderBlock).join("") : `<p style="font-size:13px;color:#8290A3;">Aucune réponse fournie.</p>`}
      </section>`
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #16233A; margin: 0; padding: 32px; }
  h1 { font-size: 20px; margin: 0 0 2px; color: #122A4D; }
</style>
</head>
<body>
  <div style="border-bottom:2px solid #122A4D;padding-bottom:12px;margin-bottom:20px;">
    <h1>${esc(data.examTitle)}</h1>
    <div style="font-size:12.5px;color:#53637A;">${esc(data.subjectName)}</div>
    <div style="font-size:12.5px;color:#53637A;margin-top:6px;">
      Copie de <strong>${esc(data.studentName)}</strong> (${esc(data.studentEmail)})
      ${data.submittedAt ? ` — soumise le ${esc(data.submittedAt)}` : ""}
    </div>
  </div>
  ${questionsHtml}
</body>
</html>`;
}
