import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../db";

const LedgerContext = createContext();

export const useLedger = () => useContext(LedgerContext);

export const LedgerProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);

  // 🔹 Load accounts on start
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const all = await db.accounts.toArray();
    setAccounts(all);
  };

  const addAccount = async (name) => {
    await db.accounts.add({ name, balance: 0 });
    await loadAccounts();
  };

  const deposit = async (accountId, amount) => {
    const acc = await db.accounts.get(accountId);
    await db.accounts.update(accountId, { balance: acc.balance + amount });
    await db.transactions.add({ accountId, type: "deposit", amount, date: new Date() });
    await loadAccounts();
  };

  const withdraw = async (accountId, amount) => {
    const acc = await db.accounts.get(accountId);
    if (acc.balance >= amount) {
      await db.accounts.update(accountId, { balance: acc.balance - amount });
      await db.transactions.add({ accountId, type: "withdraw", amount, date: new Date() });
      await loadAccounts();
    } else {
      alert("Insufficient balance");
    }
  };

  const transfer = async (fromId, toId, amount) => {
    const from = await db.accounts.get(fromId);
    const to = await db.accounts.get(toId);
    if (from.balance < amount) return alert("Insufficient balance");

    await db.transaction("rw", db.accounts, db.transactions, async () => {
      await db.accounts.update(fromId, { balance: from.balance - amount });
      await db.accounts.update(toId, { balance: to.balance + amount });
      await db.transactions.bulkAdd([
        { accountId: fromId, type: "transfer-out", amount, date: new Date() },
        { accountId: toId, type: "transfer-in", amount, date: new Date() }
      ]);
    });
    await loadAccounts();
  };

  return (
    <LedgerContext.Provider value={{ accounts, addAccount, deposit, withdraw, transfer }}>
      {children}
    </LedgerContext.Provider>
  );
};
