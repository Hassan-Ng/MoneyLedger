import React from "react";
import TransactionList from "../components/TransactionList";
import { useLedger } from "../context/LedgerContext";

export default function Transactions() {
  const { transactions } = useLedger();
  const thisMonthCount = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const now = new Date();
    return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">Transactions</h2>
      </div>

      <TransactionList />
    </div>
  );
}
