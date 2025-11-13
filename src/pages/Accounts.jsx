import React from "react";
import { useLedger } from "../context/LedgerContext";
import AccountCard from "../components/AccountCard";

export default function Accounts() {
  const { accounts } = useLedger();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Accounts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.length === 0 ? (
          <div className="card">No accounts yet. Add Easypaisa, JazzCash, etc.</div>
        ) : (
          accounts.map((a) => <AccountCard key={a.id} account={a} />)
        )}
      </div>
    </div>
  );
}
