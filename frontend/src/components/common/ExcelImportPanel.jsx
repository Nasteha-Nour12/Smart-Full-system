import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import Button from "../ui/Button";

const ExcelImportPanel = ({ title, description, onImport }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [previewRows, setPreviewRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [fileName, setFileName] = useState("");

  const parseFile = async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  };

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setResult("");
      setFileName(file.name);
      const rows = await parseFile(file);
      setAllRows(rows);
      setPreviewRows(rows.slice(0, 8));
    } catch (error) {
      setResult(error?.response?.data?.message || "Excel import failed");
    } finally {
      event.target.value = "";
    }
  };

  const handleImport = async () => {
    try {
      setBusy(true);
      const rows = previewRows.length ? previewRows : [];
      if (!rows.length || !allRows.length) {
        setResult("No parsed rows to import. Please choose a valid Excel file.");
        return;
      }
      const res = await onImport(allRows);
      const imported = res?.data?.length || 0;
      const failed = res?.failed?.length || 0;
      setResult(`Imported: ${imported}, Failed: ${failed}`);
      setPreviewRows([]);
      setAllRows([]);
      setFileName("");
    } catch (error) {
      setResult(error?.response?.data?.message || error?.message || "Excel import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}

      <div className="mt-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleSelect}
        />
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} loading={busy}>
          Upload Excel
        </Button>
        <Button type="button" onClick={handleImport} disabled={!previewRows.length} loading={busy}>
          Import Rows
        </Button>
        <span className="text-xs text-slate-500">Accepted: .xlsx .xls .csv</span>
      </div>
      {fileName ? <p className="mt-2 text-xs text-slate-500">Selected file: {fileName}</p> : null}
      {previewRows.length ? (
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-100">
              <tr>
                {Object.keys(previewRows[0] || {}).slice(0, 8).map((key) => (
                  <th key={key} className="p-2 text-left">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, idx) => (
                <tr key={idx} className="border-t">
                  {Object.keys(previewRows[0] || {}).slice(0, 8).map((key) => (
                    <td key={key} className="p-2">{String(row[key] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {result ? <p className="mt-2 text-sm text-slate-700">{result}</p> : null}
    </div>
  );
};

export default ExcelImportPanel;
