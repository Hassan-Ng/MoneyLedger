import React, { useState } from "react";
import { db } from "../db/dexieDB";
import { useLedger } from "../context/LedgerContext";
import { showSuccess, showError } from "../utils/toast";

export default function Settings() {
  const { refresh } = useLedger();
  const [importText, setImportText] = useState("");

  // Export all DB to JSON
  const handleExportJSON = async () => {
    try {
      const accounts = await db.accounts.toArray();
      const transactions = await db.transactions.toArray();
      const dump = { accounts, transactions, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sparkpair-backup-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess("JSON exported");
    } catch (err) {
      console.error(err);
      showError("Export failed");
    }
  };

  // Export transactions CSV
  const handleExportCSV = async () => {
    try {
      const transactions = await db.transactions.toArray();
      const headers = ["id","accountId","type","amount","date","source","category","note"];
      const rows = transactions.map((t) =>
        headers.map((h) => {
          const v = t[h] ?? (t.meta && h === "note" ? JSON.stringify(t.meta) : "");
          const safe = String(v).replace(/"/g, '""');
          return `"${safe}"`;
        }).join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sparkpair-transactions-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess("CSV exported");
    } catch (err) {
      console.error(err);
      showError("CSV export failed");
    }
  };

  // Import JSON into DB (simple: clears and imports)
  const handleImportJSON = async () => {
    try {
      if (!importText) return showError("Paste JSON into the input first");
      const parsed = JSON.parse(importText);
      if (!parsed.accounts || !parsed.transactions) return showError("Invalid JSON format");
      // clear DB
      await db.transaction("rw", db.accounts, db.transactions, async () => {
        await db.accounts.clear();
        await db.transactions.clear();
        if (Array.isArray(parsed.accounts) && parsed.accounts.length) {
          await db.accounts.bulkAdd(parsed.accounts.map(a => ({ ...a, id: a.id })));
        }
        if (Array.isArray(parsed.transactions) && parsed.transactions.length) {
          await db.transactions.bulkAdd(parsed.transactions.map(t => ({ ...t, id: t.id })));
        }
      });
      await refresh();
      showSuccess("Imported data");
    } catch (err) {
      console.error(err);
      showError("Import failed");
    }
  };

  // Clear all data
  const handleClearAll = async () => {
    if (!confirm("Are you sure? This will remove all accounts and transactions.")) return;
    await db.accounts.clear();
    await db.transactions.clear();
    await refresh();
    showSuccess("Cleared all data");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Backup & Export</div>
            <div className="text-xs text-slate-500">Export your data as JSON or CSV</div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="px-3 py-2 border rounded-md">Export CSV</button>
            <button onClick={handleExportJSON} className="px-3 py-2 bg-teal-700 text-white rounded-md">Export JSON</button>
          </div>
        </div>
      </div>

      <div className="card space-y-2">
        <div className="font-semibold">Import / Restore</div>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste JSON backup here"
          className="w-full border p-2 rounded-md h-32"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setImportText("")} className="px-3 py-2 border rounded-md">Clear</button>
          <button onClick={handleImportJSON} className="px-3 py-2 bg-teal-700 text-white rounded-md">Import JSON</button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Danger Zone</div>
            <div className="text-xs text-slate-500">Clear all data</div>
          </div>
          <button onClick={handleClearAll} className="px-3 py-2 bg-red-600 text-white rounded-md">Clear All</button>
        </div>
      </div>
    </div>
  );
}
