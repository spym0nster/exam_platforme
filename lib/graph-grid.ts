export const GRAPH_WIDTH = 320;
export const GRAPH_HEIGHT = 200;
const UNIT = 20;
const ORIGIN_X = GRAPH_WIDTH / 2;
const ORIGIN_Y = GRAPH_HEIGHT / 2;

export type GridLine = { x1: number; y1: number; x2: number; y2: number; axis: boolean };
export type GridLabel = { x: number; y: number; text: string };

export function buildGraphGrid() {
  const lines: GridLine[] = [];
  const labels: GridLabel[] = [];

  for (let x = 0; x <= GRAPH_WIDTH; x += UNIT) {
    lines.push({ x1: x, y1: 0, x2: x, y2: GRAPH_HEIGHT, axis: x === ORIGIN_X });
  }
  for (let y = 0; y <= GRAPH_HEIGHT; y += UNIT) {
    lines.push({ x1: 0, y1: y, x2: GRAPH_WIDTH, y2: y, axis: y === ORIGIN_Y });
  }

  for (let x = 0; x <= GRAPH_WIDTH; x += UNIT * 2) {
    const value = Math.round((x - ORIGIN_X) / UNIT);
    if (value !== 0) labels.push({ x, y: ORIGIN_Y + 12, text: String(value) });
  }
  for (let y = 0; y <= GRAPH_HEIGHT; y += UNIT * 2) {
    const value = Math.round((ORIGIN_Y - y) / UNIT);
    if (value !== 0) labels.push({ x: ORIGIN_X - 8, y: y + 3, text: String(value) });
  }

  return { lines, labels };
}
