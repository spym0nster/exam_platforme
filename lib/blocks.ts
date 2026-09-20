export type TextBlockData = { id: string; type: "text"; text: string };
export type EquationBlockData = { id: string; type: "equation"; latex: string };
export type TableBlockData = { id: string; type: "table"; rows: string[][] };
export type Point = { x: number; y: number };
export type Shape = {
  id: string;
  kind: "rect" | "circle" | "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
export type DiagramBlockData =
  | { id: string; type: "graph"; points: Point[] }
  | { id: string; type: "shapes"; shapes: Shape[] };

export type ChartDatum = { label: string; value: number };
export type ChartBlockData = {
  id: string;
  type: "chart";
  kind: "bar" | "pie";
  data: ChartDatum[];
};

export type PseudocodeBlockData = { id: string; type: "pseudocode"; code: string };

export type DiagramNode = { id: string; kind: string; x: number; y: number; label: string };
export type DiagramEdge = { id: string; from: string; to: string };
export type NodeDiagramBlockData = {
  id: string;
  type: "flowchart" | "circuit";
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

export type Block =
  | TextBlockData
  | EquationBlockData
  | TableBlockData
  | DiagramBlockData
  | ChartBlockData
  | PseudocodeBlockData
  | NodeDiagramBlockData;

export const TOOL_IDS = [
  "text",
  "equation",
  "table",
  "graph",
  "shapes",
  "chart",
  "pseudocode",
  "flowchart",
  "circuit",
] as const;

export type ToolId = (typeof TOOL_IDS)[number];

export const TOOL_LABELS: Record<ToolId, string> = {
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

export const FLOWCHART_KINDS: { id: string; label: string }[] = [
  { id: "start-end", label: "Début/Fin" },
  { id: "process", label: "Traitement" },
  { id: "io", label: "Entrée/Sortie" },
  { id: "decision", label: "Condition" },
];

export const CIRCUIT_KINDS: { id: string; label: string }[] = [
  { id: "input", label: "INPUT" },
  { id: "output", label: "OUTPUT" },
  { id: "and", label: "AND" },
  { id: "or", label: "OR" },
  { id: "not", label: "NOT" },
  { id: "xor", label: "XOR" },
  { id: "nand", label: "NAND" },
  { id: "nor", label: "NOR" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function createBlock(tool: ToolId): Block {
  switch (tool) {
    case "text":
      return { id: uid(), type: "text", text: "" };
    case "equation":
      return { id: uid(), type: "equation", latex: "" };
    case "table":
      return {
        id: uid(),
        type: "table",
        rows: [
          ["", ""],
          ["", ""],
        ],
      };
    case "graph":
      return { id: uid(), type: "graph", points: [] };
    case "shapes":
      return { id: uid(), type: "shapes", shapes: [] };
    case "chart":
      return {
        id: uid(),
        type: "chart",
        kind: "bar",
        data: [
          { label: "A", value: 10 },
          { label: "B", value: 15 },
        ],
      };
    case "pseudocode":
      return { id: uid(), type: "pseudocode", code: "" };
    case "flowchart":
      return { id: uid(), type: "flowchart", nodes: [], edges: [] };
    case "circuit":
      return { id: uid(), type: "circuit", nodes: [], edges: [] };
  }
}
