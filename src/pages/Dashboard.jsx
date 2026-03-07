import React, { useMemo } from 'react'
import { useLedger } from '../context/LedgerContext'
import AccountCard from "../components/AccountCard";

function formatLastTxLabel(dateValue) {
  if (!dateValue) return "No transactions yet"

  const date = new Date(dateValue)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) return `Today • ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
  return date.toLocaleString([], { month: "short", day: "numeric", year: "numeric" })
}

export default function Dashboard(){
  const { accounts, transactions } = useLedger()
  const visibleAccounts = accounts.filter((a) => a.active !== false && a.transactionable !== false)
  const total = visibleAccounts.reduce((s,a)=>s+Number(a.balance||0),0)
  const lastTransactionByAccount = useMemo(() => {
    const map = {}
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date).getTime()
      const current = map[tx.accountId]
      if (!current || txDate > current.ts) {
        map[tx.accountId] = { ts: txDate, date: tx.date }
      }
    })
    return map
  }, [transactions])

  return (
    <div>
      <div className="mb-6 rounded-[28px] bg-teal-700 px-7 py-7 text-white shadow-[0_20px_25px_-5px_rgba(15,118,110,0.25)]">
        <div className="text-sm font-medium text-teal-50/90">Available Balance</div>
        <div className="mt-1 text-4xl font-extrabold tracking-tight">Rs. {total.toFixed(2)}</div>
      </div>

        <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">Active Accounts</h2>
        <span className="text-xs font-semibold text-teal-700">{visibleAccounts.length} total</span>
      </div>

      <div className="space-y-2">
        {visibleAccounts.length === 0 ? (
          <div className="border rounded-2xl bg-white p-5 text-center text-sm text-slate-500">
            No accounts yet
          </div>
        ) : (
          visibleAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              subtitle={formatLastTxLabel(lastTransactionByAccount[account.id]?.date)}
              showStatusDot={false}
            />
          ))
        )}
      </div>
    </div>
  )
}
