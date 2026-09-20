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

export type Block = TextBlockData | EquationBlockData | TableBlockData | DiagramBlockData;

export type ToolId = "text" | "equation" | "table" | "graph" | "shapes";

export const TOOL_LABELS: Record<ToolId, string> = {
  text: "Texte",
  equation: "Équation",
  table: "Tableau",
  graph: "Graphe",
  shapes: "Formes",
};

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
  }
}
