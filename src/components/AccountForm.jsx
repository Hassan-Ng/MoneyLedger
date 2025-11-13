import React, { useState } from 'react'
import { useLedger } from '../context/LedgerContext'

export default function AccountForm(){
  const [name, setName] = useState('')
  const { addAccount } = useLedger()

  const submit = async (e) =>{
    e.preventDefault()
    if (!name.trim()) return
    await addAccount(name.trim())
    setName('')
  }

  return (
    <form onSubmit={submit} className="mb-4">
      <div className="flex gap-2">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New account (Easypaisa / JazzCash)" className="border p-2 rounded-md flex-1" />
        <button className="px-4 py-2 bg-teal-700 text-white rounded-md">Add</button>
      </div>
    </form>
  )
}