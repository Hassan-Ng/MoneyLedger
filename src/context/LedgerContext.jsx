import React, { createContext, useContext, useEffect, useState } from 'react'
import { db, seedDefaultAccounts } from '../db/dexieDB'
import { formatISO } from 'date-fns'

const LedgerContext = createContext()

export function LedgerProvider({ children }){
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    seedDefaultAccounts()
    const load = async () => {
      const accs = await db.accounts.toArray()
      const txs = await db.transactions.orderBy('date').reverse().toArray()
      setAccounts(accs)
      setTransactions(txs)
    }

    load()

    // hooks to refresh on change
    db.accounts.hook('creating', load)
    db.accounts.hook('updating', load)
    db.transactions.hook('creating', load)
    db.transactions.hook('updating', load)
    db.transactions.hook('deleting', load)

    return () => {}
  }, [])

  const refresh = async () => {
    const accs = await db.accounts.toArray()
    const txs = await db.transactions.orderBy('date').reverse().toArray()
    setAccounts(accs)
    setTransactions(txs)
  }

  const addAccount = async (name) => {
    const id = await db.accounts.add({ name, balance: 0, createdAt: formatISO(new Date()) })
    await refresh()
    return id
  }

  const updateBalance = async (accountId, change) => {
    const acc = await db.accounts.get(accountId)
    if (!acc) throw new Error('Account not found')
    const newBal = Number(acc.balance || 0) + Number(change)
    await db.accounts.update(accountId, { balance: newBal })
    await refresh()
  }

  const addTransaction = async ({ accountId, type, amount, date, source, category, note, toAccountId }) => {
    const tx = {
      accountId,
      type,
      amount: Number(amount),
      date: date || formatISO(new Date()),
      source: source || '',
      category: category || '',
      note: note || '',
      meta: { toAccountId: toAccountId || null }
    }

    const id = await db.transactions.add(tx)

    if (type === 'income') await updateBalance(accountId, tx.amount)
    else if (type === 'expense') await updateBalance(accountId, -tx.amount)
    else if (type === 'transfer'){
      await updateBalance(accountId, -tx.amount)
      if (toAccountId) await updateBalance(toAccountId, tx.amount)
      // mirrored entry
      await db.transactions.add({
        accountId: toAccountId,
        type: 'income',
        amount: tx.amount,
        date: tx.date,
        source: `Transfer from ${accountId}`,
        category: 'transfer',
        note: note || 'Transfer',
        meta: { mirrored: true, from: accountId }
      })
    }

    await refresh()
    return id
  }

  const removeTransaction = async (id) => {
    const tx = await db.transactions.get(id)
    if (!tx) return
    if (tx.type === 'income') await updateBalance(tx.accountId, -tx.amount)
    if (tx.type === 'expense') await updateBalance(tx.accountId, tx.amount)
    // for transfers, don't auto reverse to avoid ambiguity
    await db.transactions.delete(id)
    await refresh()
  }

  const deposit = async (accountId, amount, opts = {}) => addTransaction({ accountId, type: 'income', amount, ...opts })
  const withdraw = async (accountId, amount, opts = {}) => addTransaction({ accountId, type: 'expense', amount, ...opts })
  const transfer = async (fromId, toId, amount, opts = {}) => addTransaction({ accountId: fromId, type: 'transfer', amount, toAccountId: toId, ...opts })

  return (
    <LedgerContext.Provider value={{ accounts, transactions, addAccount, deposit, withdraw, transfer, addTransaction, removeTransaction, refresh }}>
      {children}
    </LedgerContext.Provider>
  )
}

export const useLedger = () => useContext(LedgerContext)