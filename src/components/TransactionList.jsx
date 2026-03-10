import React, { useMemo, useRef, useState } from 'react'
import { useLedger } from '../context/LedgerContext'
import EditTransactionModal from './EditTransactionModal'
import ConfirmModal from './ConfirmModal'

export default function TransactionList(){
  const { transactions, accounts, removeTransaction, updateTransaction } = useLedger()
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editingTx, setEditingTx] = useState(null)
  const [confirmDeleteTx, setConfirmDeleteTx] = useState(null)
  const lastTapRef = useRef(0)

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

  const handleDoubleTap = (tx) => {
    const now = Date.now()
    if (now - lastTapRef.current < 280) {
      setEditingTx(tx)
    }
    lastTapRef.current = now
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          value={filter}
          onChange={(e)=>setFilter(e.target.value)}
          placeholder="Search account/person/category/note"
          className="border border-slate-200 bg-white p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          value={typeFilter}
          onChange={(e)=>setTypeFilter(e.target.value)}
          className="border border-slate-200 bg-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      <div
        className="space-y-2 max-h-[75vh] overflow-auto"
        style={{ touchAction: "pan-y", overscrollBehaviorY: "contain" }}
      >
        {visible.length === 0 ? (
          <div className="border rounded-2xl bg-white p-5 text-center text-sm text-slate-500">
            No transactions found.
          </div>
        ) : visible.map(tx => (
          <div
            key={tx.id}
            className="rounded-2xl border border-transparent bg-white px-4 py-3 shadow-sm transition hover:border-slate-200"
            onDoubleClick={() => setEditingTx(tx)}
            onTouchEnd={() => handleDoubleTap(tx)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      tx.type === 'expense'
                        ? 'bg-rose-100 text-rose-700'
                        : tx.type === 'transfer'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {tx.type.toUpperCase()}
                  </span>
                  <span className="font-semibold text-slate-900 truncate">{mapAccount[tx.accountId] || '—'}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(tx.date).toLocaleString()}
                  {tx.source ? ` • ${tx.source}` : ''}
                  {tx.category ? ` • ${tx.category}` : ''}
                </div>
                {tx.note && <div className="mt-1 text-sm text-slate-700 break-words">{tx.note}</div>}
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`font-bold ${
                    tx.type === 'expense'
                      ? 'text-rose-600'
                      : tx.type === 'transfer'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {tx.type === 'transfer' ? '' : tx.type === 'expense' ? '-' : '+'} Rs. {Number(tx.amount).toFixed(2)}
                </div>
                <button
                  onClick={()=>setConfirmDeleteTx(tx)}
                  className="mt-2 text-xs px-2 py-1 border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditTransactionModal
        open={Boolean(editingTx)}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSave={(payload) => {
          updateTransaction(payload)
          setEditingTx(null)
        }}
      />

      <ConfirmModal
        open={Boolean(confirmDeleteTx)}
        title="Delete transaction?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        confirmTone="danger"
        onConfirm={() => {
          if (confirmDeleteTx) removeTransaction(confirmDeleteTx.id)
          setConfirmDeleteTx(null)
        }}
        onCancel={() => setConfirmDeleteTx(null)}
      />
    </div>
  )
}
