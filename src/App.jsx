import React from "react";
import AccountForm from "./components/AccountForm";
import AccountList from "./components/AccountList";

export default function App() {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4 text-teal-700">💰 Money Ledger</h1>
      <AccountForm />
      <AccountList />
    </div>
  );
}
