import React, { useState } from "react";
import { useLedger } from "../context/LedgerContext";
import AccountCard from "../components/AccountCard";
import CreateAccountModal from "../components/CreateAccountModal";
import { Plus } from "lucide-react";

export default function Accounts() {
  const { accounts } = useLedger();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-700">Accounts</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus size={16} /> Add Account
        </button>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.length === 0 ? (
          <div className="border p-4 rounded-lg text-center text-slate-500">
            No accounts yet. Add Easypaisa, JazzCash, etc.
          </div>
        ) : (
          accounts.map((a) => <AccountCard key={a.id} account={a} />)
        )}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <CreateAccountModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
