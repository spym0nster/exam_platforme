import { TableBlockData } from "@/lib/blocks";
import { BlockShell } from "./BlockShell";

export function TableBlock({
  block,
  onChange,
  onRemove,
}: {
  block: TableBlockData;
  onChange: (block: TableBlockData) => void;
  onRemove: () => void;
}) {
  function setCell(r: number, c: number, value: string) {
    const rows = block.rows.map((row) => [...row]);
    rows[r][c] = value;
    onChange({ ...block, rows });
  }

  function addRow() {
    const cols = block.rows[0]?.length ?? 2;
    onChange({ ...block, rows: [...block.rows, Array(cols).fill("")] });
  }

  function addColumn() {
    onChange({ ...block, rows: block.rows.map((row) => [...row, ""]) });
  }

  function removeRow(r: number) {
    if (block.rows.length <= 1) return;
    onChange({ ...block, rows: block.rows.filter((_, i) => i !== r) });
  }

  function removeColumn(c: number) {
    if ((block.rows[0]?.length ?? 0) <= 1) return;
    onChange({ ...block, rows: block.rows.map((row) => row.filter((_, i) => i !== c)) });
  }

  return (
    <BlockShell label="Tableau" onRemove={onRemove}>
      <div className="flex flex-col gap-2">
        <table className="border-collapse text-sm">
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-line p-0">
                    <input
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className="h-9 w-28 px-2 text-center outline-none focus:bg-pale"
                    />
                  </td>
                ))}
                <td className="border-none pl-2">
                  <button
                    type="button"
                    onClick={() => removeRow(r)}
                    className="text-xs text-ink-3 hover:text-bad"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-blue hover:text-blue"
          >
            + Ligne
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-blue hover:text-blue"
          >
            + Colonne
          </button>
          {(block.rows[0]?.length ?? 0) > 1 && (
            <button
              type="button"
              onClick={() => removeColumn((block.rows[0]?.length ?? 1) - 1)}
              className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink-2 hover:border-blue hover:text-blue"
            >
              − Colonne
            </button>
          )}
        </div>
      </div>
    </BlockShell>
  );
}
