import React from 'react'

export default function AccountCard({ account }){
  return (
    <div className="card flex items-center justify-between">
      <div>
        <div className="font-semibold text-lg">{account.name}</div>
        <div className="text-xs text-slate-500">Created: {new Date(account.createdAt).toLocaleString()}</div>
      </div>
      <div className="text-right">
        <div className="font-bold text-teal-700 text-lg">Rs. {Number(account.balance || 0).toFixed(2)}</div>
      </div>
    </div>
  )
}