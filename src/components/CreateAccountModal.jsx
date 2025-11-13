import React, { useState } from "react";
import { useLedger } from "../context/LedgerContext";

export default function CreateAccountModal({ onClose }) {
  const { addAccount } = useLedger();
  const [form, setForm] = useState({
    name: "",
    balance: 0,
    type: "Wallet",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addAccount({
      name: form.name.trim(),
      balance: Number(form.balance) || 0,
      type: form.type,
    });
    setForm({ name: "", balance: 0, type: "Wallet" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Wallet">Wallet</option>
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Opening Balance</label>
            <input
              type="number"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

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
