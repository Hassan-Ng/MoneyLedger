import React, { useState } from "react";
import { useLedger } from "../context/LedgerContext";
import CreateAccountModal from "../components/CreateAccountModal";
import AccountCard from "../components/AccountCard";
import AccountActionModal from "../components/AccountActionModal";
import { Plus } from "lucide-react";
import { showError, showSuccess } from "../utils/toast";

export default function Summary() {
  const { accounts, transactions, setAccountActive, deleteAccount } = useLedger();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const groupAccounts = accounts.filter((account) => account.transactionable === false);
  const accountsWithTransactions = new Set(transactions.map((tx) => tx.accountId));

  const handleDeleteAccount = (account) => {
    try {
      deleteAccount(account.id);
      showSuccess("Group account deleted.");
      setSelectedAccount(null);
    } catch (error) {
      showError(error?.message || "Could not delete group account.");
    }
  };

  const handleToggleActive = (account) => {
    setAccountActive(account.id, account.active === false);
    setSelectedAccount(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">Group Accounts</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition text-sm"
        >
          <Plus size={16} /> Add Group
        </button>
      </div>

      <div className="space-y-2">
        {groupAccounts.length === 0 ? (
          <div className="border rounded-2xl bg-white p-5 text-center text-sm text-slate-500">
            No group accounts yet
          </div>
        ) : (
          groupAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              subtitle={`Created: ${new Date(account.createdAt).toLocaleString()}`}
              onClick={() => setSelectedAccount(account)}
              showStatusDot={false}
            />
          ))
        )}
      </div>

      {isModalOpen && <CreateAccountModal mode="summary" onClose={() => setIsModalOpen(false)} />}

      <AccountActionModal
        account={selectedAccount}
        canDelete={selectedAccount ? !accountsWithTransactions.has(selectedAccount.id) : false}
        onClose={() => setSelectedAccount(null)}
        onToggleActive={handleToggleActive}
        onDelete={handleDeleteAccount}
        showToggleActive={false}
      />
    </div>
  );
}
