import React from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { useLedger } from "../context/LedgerContext";

export default function Transactions() {
  const { accounts } = useLedger();
  const activeAccounts = accounts.filter(
    (account) => account.active !== false && account.transactionable !== false
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Transactions</h2>
      <TransactionForm accounts={activeAccounts} />
      <TransactionList />
    </div>
  );
}
