import React, { useEffect, useState } from 'react'
import { useLedger } from '../context/LedgerContext'

export default function TransactionForm({ accounts }){
  const { addTransaction } = useLedger()
  const [type, setType] = useState('income')
  const [accountId, setAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')

  useEffect(()=>{
    if (accounts && accounts.length) setAccountId(accounts[0].id)
  },[accounts])

  const submit = async (e) =>{
    e.preventDefault()
    if (!accountId || !amount) return
    await addTransaction({ accountId: Number(accountId), type, amount: Number(amount), source, category, note, toAccountId: type === 'transfer' ? Number(toAccountId) : undefined })
    setAmount(''); setNote(''); setSource(''); setCategory('')
  }

  return (
    <form onSubmit={submit} className="card mb-4">
      <div className="flex gap-2 mb-3">
        <select value={type} onChange={(e)=>setType(e.target.value)} className="border p-2 rounded-md">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>

        <select value={accountId} onChange={(e)=>setAccountId(e.target.value)} className="border p-2 rounded-md flex-1">
          <option value="">Select Account</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        {type === 'transfer' && (
          <select value={toAccountId} onChange={(e)=>setToAccountId(e.target.value)} className="border p-2 rounded-md">
            <option value="">To</option>
            {accounts.map(a => <option key={`to-${a.id}`} value={a.id}>{a.name}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <input value={amount} onChange={(e)=>setAmount(e.target.value)} type="number" placeholder="Amount" className="border p-2 rounded-md" />
        <input value={source} onChange={(e)=>setSource(e.target.value)} placeholder="From / To (person)" className="border p-2 rounded-md" />
        <input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="Category (sale/expense)" className="border p-2 rounded-md" />
      </div>

      <textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Note (optional)" className="border p-2 rounded-md w-full mb-3" />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={()=>{setAmount(''); setNote(''); setSource(''); setCategory('')}} className="px-3 py-2 rounded-md border">Clear</button>
        <button className="px-4 py-2 rounded-md bg-teal-700 text-white">Save</button>
      </div>
    </form>
  )
}