import Dexie from 'dexie'

export const db = new Dexie('sparkpairLedger')

db.version(1).stores({
  accounts: '++id,name,balance,createdAt',
  transactions: '++id,accountId,type,amount,date,source,category,note,meta'
})

export async function seedDefaultAccounts() {
  const c = await db.accounts.count()
  if (c === 0) {
    await db.accounts.bulkAdd([
      { name: 'Easypaisa', balance: 0, createdAt: new Date().toISOString() },
      { name: 'JazzCash', balance: 0, createdAt: new Date().toISOString() }
    ])
  }
}