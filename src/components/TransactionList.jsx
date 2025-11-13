import React, { useMemo, useState } from 'react'
import { useLedger } from '../context/LedgerContext'

export default function TransactionList(){
  const { transactions, accounts, removeTransaction } = useLedger()
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const mapAccount = useMemo(()=>{
    const m = {}
    accounts.forEach(a => m[a.id] = a.name)
    return m
  }, [accounts])

  const visible = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false
    if (!filter) return true
    const q = filter.toLowerCase()
    return (tx.source || '').toLowerCase().includes(q) || (tx.category || '').toLowerCase().includes(q) || (tx.note || '').toLowerCase().includes(q) || (mapAccount[tx.accountId] || '').toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Search person/category/note" className="border p-2 rounded-md flex-1" />
        <select value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)} className="border p-2 rounded-md">
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      <div className="space-y-3 max-h-[480px] overflow-auto">
        {visible.map(tx => (
          <div key={tx.id} className="card flex justify-between items-start">
            <div>
              <div className="font-semibold">{tx.type.toUpperCase()} • {mapAccount[tx.accountId] || '—'}</div>
              <div className="text-xs text-slate-500">{new Date(tx.date).toLocaleString()} • {tx.source} • {tx.category}</div>
              {tx.note && <div className="mt-1 text-sm">{tx.note}</div>}
            </div>
            <div className="text-right">
              <div className={`font-bold ${tx.type === 'expense' ? 'text-red-600' : 'text-teal-700'}`}>Rs. {Number(tx.amount).toFixed(2)}</div>
              <div className="mt-2 flex gap-2 justify-end">
                <button onClick={()=>removeTransaction(tx.id)} className="text-xs px-2 py-1 border rounded-md">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}