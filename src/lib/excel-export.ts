import * as XLSX from "xlsx";

/** Export an array of plain objects to an .xlsx file and trigger a download. */
export function exportToExcel(
  rows: Record<string, string | number>[],
  fileBaseName: string,
  sheetName = "Sheet1",
) {
  const ws = XLSX.utils.json_to_sheet(rows);
  // Auto-size columns based on the longest cell in each column.
  const keys = rows.length ? Object.keys(rows[0]) : [];
  ws["!cols"] = keys.map((k) => {
    const maxLen = Math.max(
      k.length,
      ...rows.map((r) => String(r[k] ?? "").length),
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileBaseName}-${date}.xlsx`);
}
