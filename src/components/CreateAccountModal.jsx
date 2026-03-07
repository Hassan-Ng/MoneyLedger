import React, { useState } from "react";
import { useLedger } from "../context/LedgerContext";

export default function CreateAccountModal({ onClose, mode = "all" }) {
  const { addAccount, accounts } = useLedger();
  const sourceCandidates = accounts.filter((account) => account.transactionable !== false);
  const hasGroupUsingNegativeAdjustment = accounts.some(
    (account) => account.transactionable === false && account.includeOtherNegativeAccounts === true
  );
  const defaultMode =
    mode === "transactionable" ? "transactionable" : mode === "summary" ? "summary" : "transactionable";
  const [form, setForm] = useState({
    name: "",
    balance: 0,
    accountMode: defaultMode,
    sourceAccountIds: [],
    includeOtherNegativeAccounts: false,
  });
  const currentMode = mode === "all" ? form.accountMode : defaultMode;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (currentMode === "summary" && form.sourceAccountIds.length === 0) return;

    await addAccount({
      name: form.name.trim(),
      balance: Number(form.balance) || 0,
      transactionable: currentMode !== "summary",
      sourceAccountIds: form.sourceAccountIds,
      includeOtherNegativeAccounts: form.includeOtherNegativeAccounts,
    });
    setForm({
      name: "",
      balance: 0,
      accountMode: defaultMode,
      sourceAccountIds: [],
      includeOtherNegativeAccounts: false,
    });
    onClose();
  };

  const toggleSourceAccount = (accountId) => {
    setForm((prev) => ({
      ...prev,
      sourceAccountIds: prev.sourceAccountIds.includes(accountId)
        ? prev.sourceAccountIds.filter((id) => id !== accountId)
        : [...prev.sourceAccountIds, accountId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-md p-6 relative">
        <h3 className="text-lg font-semibold mb-4 text-teal-700">Add New Account</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Account Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Easypaisa, JazzCash, etc."
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {mode === "all" && (
            <div>
              <label className="block text-sm font-medium mb-2">Account Mode</label>
              <div className="flex gap-3">
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="radio"
                    name="accountMode"
                    checked={form.accountMode === "transactionable"}
                    onChange={() => setForm({ ...form, accountMode: "transactionable" })}
                  />
                  Transactionable
                </label>
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="radio"
                    name="accountMode"
                    checked={form.accountMode === "summary"}
                    onChange={() => setForm({ ...form, accountMode: "summary", balance: 0 })}
                  />
                  Summary (non-transactionable)
                </label>
              </div>
            </div>
          )}

          {currentMode === "transactionable" && (
            <div>
              <label className="block text-sm font-medium mb-1">Opening Balance</label>
              <input
                type="number"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {currentMode === "summary" && (
            <div>
              <label className="block text-sm font-medium mb-1">Included Accounts</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
                {sourceCandidates.length === 0 ? (
                  <div className="text-sm text-slate-500">No transactionable accounts available.</div>
                ) : (
                  sourceCandidates.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => toggleSourceAccount(account.id)}
                      className={`text-left border rounded-lg p-3 transition ${
                        form.sourceAccountIds.includes(account.id)
                          ? "border-teal-600 bg-teal-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-800">{account.name}</div>
                      <div className="text-xs text-slate-500">Rs. {Number(account.balance || 0).toFixed(2)}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {currentMode === "summary" && !hasGroupUsingNegativeAdjustment && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.includeOtherNegativeAccounts}
                onChange={(e) =>
                  setForm({ ...form, includeOtherNegativeAccounts: e.target.checked })
                }
              />
              Subtract all other transactionable accounts that are in negative balance
            </label>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={currentMode === "summary" && form.sourceAccountIds.length === 0}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
