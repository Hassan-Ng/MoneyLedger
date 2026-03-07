import React, { useState } from "react";
import { useLedger } from "../context/LedgerContext";
import CreateAccountModal from "../components/CreateAccountModal";
import AccountCard from "../components/AccountCard";
import AccountActionModal from "../components/AccountActionModal";
import AccountTransactionModal from "../components/AccountTransactionModal";
import { Plus } from "lucide-react";
import { showError, showSuccess } from "../utils/toast";

export default function Accounts() {
  const { accounts, transactions, setAccountActive, deleteAccount, addTransaction } = useLedger();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionAccount, setTransactionAccount] = useState(null);
  const transactionableAccounts = accounts.filter((account) => account.transactionable !== false);
  const accountsWithTransactions = new Set(transactions.map((tx) => tx.accountId));

  const handleDeleteAccount = (account) => {
    try {
      deleteAccount(account.id);
      showSuccess("Account deleted.");
      setSelectedAccount(null);
    } catch (error) {
      showError(error?.message || "Could not delete account.");
    }
  };

  const handleToggleActive = (account) => {
    setAccountActive(account.id, account.active === false);
    setSelectedAccount(null);
  };

  const handleOpenTransactionModal = (account) => {
    setSelectedAccount(null);
    setTransactionAccount(account);
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">Accounts</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition text-sm"
        >
          <Plus size={16} /> Add Account
        </button>
      </div>

      <div className="space-y-2">
        {transactionableAccounts.length === 0 ? (
          <div className="border p-4 rounded-lg text-center text-slate-500">
            No accounts yet. Add Easypaisa, JazzCash, etc.
          </div>
        ) : (
          transactionableAccounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              subtitle={`Created: ${new Date(a.createdAt).toLocaleString()}`}
              onClick={() => setSelectedAccount(a)}
            />
          ))
        )}
      </div>

      {isModalOpen && (
        <CreateAccountModal mode="transactionable" onClose={() => setIsModalOpen(false)} />
      )}

      <AccountActionModal
        account={selectedAccount}
        canDelete={selectedAccount ? !accountsWithTransactions.has(selectedAccount.id) : false}
        onClose={() => setSelectedAccount(null)}
        onToggleActive={handleToggleActive}
        onDelete={handleDeleteAccount}
        onMakeTransaction={handleOpenTransactionModal}
      />

      <AccountTransactionModal
        account={transactionAccount}
        accounts={transactionableAccounts}
        onClose={() => setTransactionAccount(null)}
        onSave={(payload) => addTransaction(payload)}
      />
    </div>
  );
}
