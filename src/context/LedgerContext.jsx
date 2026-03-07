import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { formatISO } from "date-fns";

const LedgerContext = createContext();

const ACCOUNTS_KEY = "ledger_accounts";
const TRANSACTIONS_KEY = "ledger_transactions";
const IMPORT_EXPORT_VERSION = 1;

function isValidAccount(account) {
  return (
    account &&
    typeof account === "object" &&
    typeof account.id === "number" &&
    typeof account.name === "string" &&
    typeof account.type === "string" &&
    typeof account.balance === "number" &&
    (account.active === undefined || typeof account.active === "boolean") &&
    (account.transactionable === undefined || typeof account.transactionable === "boolean") &&
    (account.includeOtherNegativeAccounts === undefined ||
      typeof account.includeOtherNegativeAccounts === "boolean") &&
    (account.sourceAccountIds === undefined ||
      (Array.isArray(account.sourceAccountIds) &&
        account.sourceAccountIds.every((id) => typeof id === "number")))
  );
}

function isValidTransaction(tx) {
  return (
    tx &&
    typeof tx === "object" &&
    typeof tx.id === "number" &&
    typeof tx.accountId === "number" &&
    typeof tx.type === "string" &&
    typeof tx.amount === "number"
  );
}

function normalizeAccount(account) {
  return {
    ...account,
    active: account.active !== false,
    transactionable: account.transactionable !== false,
    includeOtherNegativeAccounts: account.includeOtherNegativeAccounts === true,
    sourceAccountIds: Array.isArray(account.sourceAccountIds) ? account.sourceAccountIds : [],
    balance: Number(account.balance || 0),
  };
}

function computeAccountBalances(accounts) {
  const byId = new Map(accounts.map((account) => [account.id, account]));

  const resolveBalance = (accountId, seen = new Set()) => {
    const account = byId.get(accountId);
    if (!account) return 0;
    if (account.transactionable !== false) return Number(account.balance || 0);
    if (seen.has(accountId)) return 0;

    const nextSeen = new Set(seen);
    nextSeen.add(accountId);
    let total = account.sourceAccountIds.reduce((sum, sourceId) => sum + resolveBalance(sourceId, nextSeen), 0);
    if (account.includeOtherNegativeAccounts) {
      const selected = new Set(account.sourceAccountIds);
      const extraNegative = accounts
        .filter(
          (candidate) =>
            candidate.id !== account.id &&
            candidate.transactionable !== false &&
            !selected.has(candidate.id) &&
            Number(candidate.balance || 0) < 0
        )
        .reduce((sum, candidate) => sum + Number(candidate.balance || 0), 0);
      total += extraNegative;
    }
    return total;
  };

  return accounts.map((account) => {
    if (account.transactionable !== false) return account;
    return { ...account, balance: resolveBalance(account.id) };
  });
}

export function LedgerProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Load data from localStorage
  const loadData = () => {
    const accs = (JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || []).map(normalizeAccount);
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
  const computedAccounts = useMemo(() => computeAccountBalances(accounts), [accounts]);

  const exportData = () => ({
    version: IMPORT_EXPORT_VERSION,
    exportedAt: formatISO(new Date()),
    accounts: computedAccounts,
    transactions,
  });

  const importData = (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid import file.");
    }

    const importedAccounts = Array.isArray(payload.accounts)
      ? payload.accounts.map(normalizeAccount)
      : null;
    const importedTransactions = Array.isArray(payload.transactions) ? payload.transactions : null;
    if (!importedAccounts || !importedTransactions) {
      throw new Error("Import file must include accounts and transactions arrays.");
    }

    if (!importedAccounts.every(isValidAccount) || !importedTransactions.every(isValidTransaction)) {
      throw new Error("Import file contains invalid account or transaction entries.");
    }

    setAccounts(importedAccounts);
    setTransactions(importedTransactions);
    saveAccounts(importedAccounts);
    saveTransactions(importedTransactions);
  };

  // Add a new account
  const addAccount = ({
    name,
    type = "Wallet",
    balance = 0,
    transactionable = true,
    sourceAccountIds = [],
    includeOtherNegativeAccounts = false,
  }) => {
    const isTransactionable = transactionable !== false;
    const newAccount = {
      id: Date.now(),
      name,
      type,
      balance: isTransactionable ? Number(balance || 0) : 0,
      active: true,
      transactionable: isTransactionable,
      includeOtherNegativeAccounts: isTransactionable ? false : includeOtherNegativeAccounts === true,
      sourceAccountIds: isTransactionable ? [] : sourceAccountIds,
      createdAt: new Date(),
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
  };

  const setAccountActive = (accountId, isActive) => {
    const updatedAccounts = accounts.map((acc) =>
      acc.id === accountId ? { ...acc, active: Boolean(isActive) } : acc
    );
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
  };

  const deleteAccount = (accountId) => {
    const hasTransactions = transactions.some((tx) => tx.accountId === accountId);
    if (hasTransactions) {
      throw new Error("Only accounts with no transactions can be deleted.");
    }

    const updatedAccounts = accounts.filter((acc) => acc.id !== accountId);
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
  };

  // Update account balance
  const updateBalance = (accountId, change) => {
    setAccounts((prev) => {
      const updatedAccounts = prev.map((acc) =>
        acc.id === accountId && acc.transactionable !== false
          ? { ...acc, balance: (acc.balance || 0) + change }
          : acc
      );
      saveAccounts(updatedAccounts);
      return updatedAccounts;
    });
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
    const sourceAccount = accounts.find((acc) => acc.id === accountId);
    if (!sourceAccount || sourceAccount.transactionable === false) {
      throw new Error("Selected account cannot be used for transactions.");
    }

    if (type === "transfer") {
      const destinationAccount = accounts.find((acc) => acc.id === toAccountId);
      if (!destinationAccount || destinationAccount.transactionable === false) {
        throw new Error("Transfer destination account is not transactionable.");
      }
      if (toAccountId === accountId) {
        throw new Error("Transfer destination must be different from source account.");
      }
    }

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
    }
  };

  // Remove transaction
  const removeTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse balance changes
    if (tx.type === "income") updateBalance(tx.accountId, -tx.amount);
    if (tx.type === "expense") updateBalance(tx.accountId, tx.amount);
    if (tx.type === "transfer") {
      updateBalance(tx.accountId, tx.amount);
      if (tx.meta?.toAccountId) updateBalance(tx.meta.toAccountId, -tx.amount);
    }

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
        accounts: computedAccounts,
        transactions,
        addAccount,
        setAccountActive,
        deleteAccount,
        deposit,
        withdraw,
        transfer,
        addTransaction,
        removeTransaction,
        refresh,
        exportData,
        importData,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export const useLedger = () => useContext(LedgerContext);
