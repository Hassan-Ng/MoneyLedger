import React, { createContext, useContext, useEffect, useState } from "react";
import { formatISO } from "date-fns";

const LedgerContext = createContext();

const ACCOUNTS_KEY = "ledger_accounts";
const TRANSACTIONS_KEY = "ledger_transactions";

export function LedgerProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Load data from localStorage
  const loadData = () => {
    const accs = JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
    const txs = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
    setAccounts(accs);
    setTransactions(txs);
  };

  // Save accounts or transactions to localStorage
  const saveAccounts = (accs) => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
  const saveTransactions = (txs) => localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));

  useEffect(() => {
    // Initialize default accounts if none exist
    const accs = JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
    if (accs.length === 0) {
      const now = new Date();
    }
    loadData();
  }, []);

  const refresh = loadData;

  // Add a new account
  const addAccount = ({ name, type = "Wallet" }) => {
    const newAccount = {
      id: Date.now(),
      name,
      type,
      balance: 0,
      createdAt: new Date(),
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
  };

  // Update account balance
  const updateBalance = (accountId, change) => {
    const updatedAccounts = accounts.map((acc) =>
      acc.id === accountId ? { ...acc, balance: (acc.balance || 0) + change } : acc
    );
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
  };

  // Add a transaction
  const addTransaction = ({
    accountId,
    type,
    amount,
    date,
    source,
    category,
    note,
    toAccountId,
  }) => {
    const tx = {
      id: Date.now(),
      accountId,
      type,
      amount: Number(amount),
      date: date || formatISO(new Date()),
      source: source || "",
      category: category || "",
      note: note || "",
      meta: { toAccountId: toAccountId || null },
    };

    const updatedTransactions = [tx, ...transactions];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Update balances
    if (type === "income") updateBalance(accountId, tx.amount);
    else if (type === "expense") updateBalance(accountId, -tx.amount);
    else if (type === "transfer") {
      updateBalance(accountId, -tx.amount);
      if (toAccountId) updateBalance(toAccountId, tx.amount);

      // mirrored transaction
      if (toAccountId) {
        const mirroredTx = {
          ...tx,
          id: Date.now() + 1,
          accountId: toAccountId,
          type: "income",
          source: `Transfer from ${accountId}`,
          category: "transfer",
          meta: { mirrored: true, from: accountId },
        };
        const newTxs = [mirroredTx, ...updatedTransactions];
        setTransactions(newTxs);
        saveTransactions(newTxs);
      }
    }
  };

  // Remove transaction
  const removeTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse balance changes
    if (tx.type === "income") updateBalance(tx.accountId, -tx.amount);
    if (tx.type === "expense") updateBalance(tx.accountId, tx.amount);

    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  const deposit = (accountId, amount, opts = {}) =>
    addTransaction({ accountId, type: "income", amount, ...opts });
  const withdraw = (accountId, amount, opts = {}) =>
    addTransaction({ accountId, type: "expense", amount, ...opts });
  const transfer = (fromId, toId, amount, opts = {}) =>
    addTransaction({ accountId: fromId, type: "transfer", amount, toAccountId: toId, ...opts });

  return (
    <LedgerContext.Provider
      value={{
        accounts,
        transactions,
        addAccount,
        deposit,
        withdraw,
        transfer,
        addTransaction,
        removeTransaction,
        refresh,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export const useLedger = () => useContext(LedgerContext);
