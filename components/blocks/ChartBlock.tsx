import { ChartBlockData, ChartDatum } from "@/lib/blocks";
import { BlockShell } from "./BlockShell";

const COLORS = ["#298DCA", "#F5B335", "#1E7A4D", "#122A4D", "#B8801A", "#0B4F86"];
const WIDTH = 320;
const HEIGHT = 200;

export function BarChart({ data }: { data: ChartDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = data.length ? (WIDTH - 20) / data.length : 0;
  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="rounded bg-paper">
      <line x1={10} y1={HEIGHT - 20} x2={WIDTH - 10} y2={HEIGHT - 20} stroke="#D9E3EC" />
      {data.map((d, i) => {
        const h = ((HEIGHT - 40) * d.value) / max;
        const x = 10 + i * barWidth + barWidth * 0.15;
        const w = barWidth * 0.7;
        const y = HEIGHT - 20 - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={COLORS[i % COLORS.length]} rx={3} />
            <text x={x + w / 2} y={HEIGHT - 6} fontSize={10} textAnchor="middle" fill="#53637A">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function PieChart({ data }: { data: ChartDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = HEIGHT / 2;
  const cy = HEIGHT / 2;
  const r = HEIGHT / 2 - 10;
  const boundaries = data.reduce<number[]>(
    (acc, d) => [...acc, acc[acc.length - 1] + (d.value / total) * 2 * Math.PI],
    [-Math.PI / 2]
  );
  const slices = data.map((d, i) => {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
        fill={COLORS[i % COLORS.length]}
      />
    );
  });
  return (
    <svg width={HEIGHT} height={HEIGHT} viewBox={`0 0 ${HEIGHT} ${HEIGHT}`} className="rounded bg-paper">
      {slices}
    </svg>
  );
}

export function ChartBlock({
  block,
  onChange,
  onRemove,
}: {
  block: ChartBlockData;
  onChange: (block: ChartBlockData) => void;
  onRemove: () => void;
}) {
  function setDatum(i: number, patch: Partial<ChartDatum>) {
    const data = block.data.map((d, idx) => (idx === i ? { ...d, ...patch } : d));
    onChange({ ...block, data });
  }

  function addRow() {
    onChange({ ...block, data: [...block.data, { label: "", value: 0 }] });
  }

  function removeRow(i: number) {
    if (block.data.length <= 1) return;
    onChange({ ...block, data: block.data.filter((_, idx) => idx !== i) });
  }

  return (
    <BlockShell label="Graphique" onRemove={onRemove}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {(["bar", "pie"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => onChange({ ...block, kind })}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  block.kind === kind ? "bg-blue text-white" : "bg-soft text-ink-2"
                }`}
              >
                {kind === "bar" ? "Barres" : "Camembert"}
              </button>
            ))}
          </div>
          <table className="border-collapse text-sm">
            <tbody>
              {block.data.map((d, i) => (
                <tr key={i}>
                  <td className="border border-line p-0">
                    <input
                      value={d.label}
                      onChange={(e) => setDatum(i, { label: e.target.value })}
                      placeholder="Étiquette"
                      className="h-8 w-24 px-2 outline-none focus:bg-pale"
                    />
                  </td>
                  <td className="border border-line p-0">
                    <input
                      type="number"
                      value={d.value}
                      onChange={(e) => setDatum(i, { value: Number(e.target.value) })}
                      className="h-8 w-20 px-2 outline-none focus:bg-pale"
                    />
                  </td>
                  <td className="border-none pl-2">
                    <button type="button" onClick={() => removeRow(i)} className="text-xs text-ink-3 hover:text-bad">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addRow}
            className="w-fit rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-blue hover:text-blue"
          >
            + Ligne
          </button>
        </div>
        <div className="rounded-lg border border-line bg-soft p-2">
          {block.kind === "bar" ? <BarChart data={block.data} /> : <PieChart data={block.data} />}
        </div>
      </div>
    </BlockShell>
  );
}
