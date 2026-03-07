import React, { useRef } from "react";
import { useLedger } from "../context/LedgerContext";
import { showError, showSuccess } from "../utils/toast";

export default function Settings() {
  const { exportData, importData } = useLedger();
  const fileInputRef = useRef(null);

  const handleExportData = () => {
    try {
      const data = exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const dateStamp = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bizledger-backup-${dateStamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess("Backup exported.");
    } catch {
      showError("Could not export data.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmImport = window.confirm(
      "Importing will replace all current accounts and transactions. Continue?"
    );
    if (!confirmImport) {
      event.target.value = "";
      return;
    }

    try {
      const json = await file.text();
      const parsed = JSON.parse(json);
      importData(parsed);
      showSuccess("Data imported successfully.");
    } catch (error) {
      showError(error?.message || "Import failed.");
    } finally {
      event.target.value = "";
    }
  };

  const handleClearData = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all data? This action cannot be undone."
    );
    if (confirmClear) {
      localStorage.clear();
      showSuccess("All app data has been cleared.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Settings</h2>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition"
        >
          Export Data
        </button>
        <button
          onClick={handleImportClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Import Data
        </button>
        <button
          onClick={handleClearData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Clear All Data
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportData}
      />
    </div>
  );
}
