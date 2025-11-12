import React, { useState } from "react";
import { useLedger } from "../context/LedgerContext";

export default function AccountForm() {
  const [name, setName] = useState("");
  const { addAccount } = useLedger();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    await addAccount(name);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Account name"
        className="border p-2 flex-1 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="bg-teal-600 text-white px-4 py-2 rounded">Add</button>
    </form>
  );
}
