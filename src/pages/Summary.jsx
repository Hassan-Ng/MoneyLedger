import React, { useMemo } from "react";
import { useLedger } from "../context/LedgerContext";

export default function Summary() {
  const { accounts, transactions } = useLedger();

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const transfer = transactions
      .filter((t) => t.category === "transfer" || t.type === "transfer")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const accountTotal = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    return { income, expense, transfer, accountTotal };
  }, [transactions, accounts]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Summary</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-slate-500">Total Balance</div>
          <div className="text-xl font-bold text-teal-700">Rs. {totals.accountTotal.toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="text-xs text-slate-500">Total Income</div>
          <div className="text-xl font-bold">Rs. {totals.income.toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="text-xs text-slate-500">Total Expense</div>
          <div className="text-xl font-bold text-red-600">Rs. {totals.expense.toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="text-xs text-slate-500">Transfers</div>
          <div className="text-xl font-bold">Rs. {totals.transfer.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
