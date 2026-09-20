import type { DiagramNode } from "@/lib/blocks";

const BOX_W = 96;
const BOX_H = 40;

export function NodeShapeView({
  node,
  selected = false,
  variant,
}: {
  node: DiagramNode;
  selected?: boolean;
  variant: "flowchart" | "circuit";
}) {
  const stroke = selected ? "#298DCA" : "#122A4D";
  const strokeWidth = selected ? 2.5 : 2;
  const label = (
    <text x={node.x} y={node.y + 4} fontSize={11} textAnchor="middle" fill="#16233A">
      {node.label}
    </text>
  );

  if (variant === "flowchart") {
    if (node.kind === "start-end") {
      return (
        <>
          <ellipse cx={node.x} cy={node.y} rx={BOX_W / 2} ry={BOX_H / 2} fill="#fff" stroke={stroke} strokeWidth={strokeWidth} />
          {label}
        </>
      );
    }
    if (node.kind === "decision") {
      const w = BOX_W / 2;
      const h = BOX_H / 2 + 8;
      const points = `${node.x},${node.y - h} ${node.x + w},${node.y} ${node.x},${node.y + h} ${node.x - w},${node.y}`;
      return (
        <>
          <polygon points={points} fill="#fff" stroke={stroke} strokeWidth={strokeWidth} />
          {label}
        </>
      );
    }
    if (node.kind === "io") {
      const w = BOX_W / 2;
      const h = BOX_H / 2;
      const skew = 12;
      const points = `${node.x - w + skew},${node.y - h} ${node.x + w},${node.y - h} ${node.x + w - skew},${node.y + h} ${node.x - w},${node.y + h}`;
      return (
        <>
          <polygon points={points} fill="#fff" stroke={stroke} strokeWidth={strokeWidth} />
          {label}
        </>
      );
    }
    return (
      <>
        <rect x={node.x - BOX_W / 2} y={node.y - BOX_H / 2} width={BOX_W} height={BOX_H} fill="#fff" stroke={stroke} strokeWidth={strokeWidth} rx={4} />
        {label}
      </>
    );
  }

  if (node.kind === "input" || node.kind === "output") {
    return (
      <>
        <circle cx={node.x} cy={node.y} r={20} fill="#fff" stroke={stroke} strokeWidth={strokeWidth} />
        {label}
      </>
    );
  }
  return (
    <>
      <rect x={node.x - BOX_W / 2} y={node.y - BOX_H / 2} width={BOX_W} height={BOX_H} fill="#fff" stroke={stroke} strokeWidth={strokeWidth} rx={6} />
      {label}
    </>
  );
}
