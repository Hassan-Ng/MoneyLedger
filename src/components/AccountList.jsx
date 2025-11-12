import React, { useState } from "react";
import { useLedger } from "../context/LedgerContext";

export default function AccountList() {
  const { accounts, deposit, withdraw, transfer } = useLedger();
  const [amount, setAmount] = useState("");
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Accounts</h2>
      <ul>
        {accounts.map((a) => (
          <li key={a.id} className="border p-2 mb-2 rounded flex justify-between">
            <span>{a.name}</span>
            <span>Rs. {a.balance}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Deposit / Withdraw</h3>
        <select onChange={(e) => setFromId(Number(e.target.value))} className="border p-2 mr-2">
          <option value="">Select Account</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input
          type="number"
          placeholder="Amount"
          className="border p-2 mr-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={() => deposit(fromId, +amount)} className="bg-green-600 text-white px-3 py-2 mr-2 rounded">
          Deposit
        </button>
        <button onClick={() => withdraw(fromId, +amount)} className="bg-red-600 text-white px-3 py-2 rounded">
          Withdraw
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Transfer</h3>
        <select onChange={(e) => setFromId(Number(e.target.value))} className="border p-2 mr-2">
          <option value="">From</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select onChange={(e) => setToId(Number(e.target.value))} className="border p-2 mr-2">
          <option value="">To</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input
          type="number"
          placeholder="Amount"
          className="border p-2 mr-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={() => transfer(fromId, toId, +amount)} className="bg-blue-600 text-white px-3 py-2 rounded">
          Transfer
        </button>
      </div>
    </div>
  );
}
