import Dexie from "dexie";

export const db = new Dexie("moneyLedgerDB");
db.version(1).stores({
  accounts: "++id,name,balance",
  transactions: "++id,accountId,type,amount,date"
});
