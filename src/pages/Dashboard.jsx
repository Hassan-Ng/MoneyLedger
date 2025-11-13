import React from 'react'
import { useLedger } from '../context/LedgerContext'
import AccountCard from '../components/AccountCard'

export default function Dashboard(){
  const { accounts } = useLedger()
  const total = accounts.reduce((s,a)=>s+Number(a.balance||0),0)

  return (
    <div>
      <div className="card mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Overview</h2>
          <div className="text-sm text-slate-500">Total balance across accounts</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-teal-700">Rs. {total.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.map(a => <AccountCard key={a.id} account={a} />)}
      </div>
    </div>
  )
}