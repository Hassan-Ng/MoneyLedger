import React, { useRef } from "react";
import { Download, Upload, ChevronRight } from "lucide-react";
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
    <div className="animate-in fade-in duration-500">
      <header className="space-y-1 mb-2">
        <h2 className="text-md font-bold tracking-wide text-slate-500 uppercase">Settings</h2>
      </header>

      <main className="space-y-8">
        {/* Data Management Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Data Management
          </h3>
          
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Export Card */}
            <button 
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Download size={18} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Export Backup</p>
                  <p className="text-xs text-slate-500">Save your ledgers to a .json file</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            {/* Import Card */}
            <button 
              onClick={handleImportClick}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Import Data</p>
                  <p className="text-xs text-slate-500">Restore from a previous backup</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 px-1">
            Danger Zone
          </h3>
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-rose-900">Clear All Records</p>
              <p className="text-xs text-rose-600/70">Wipe all accounts and history permanently.</p>
            </div>
            <button 
              onClick={handleClearData}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95"
            >
              Reset
            </button>
          </div>
        </section>
      </main>

      {/* App Info Footer */}
      <footer className="text-center pt-8">
        <p className="text-xs text-slate-400">BizLedger v1.2.0</p>
        <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">Powered by SparkPair</p>
      </footer>

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
