import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { registerModalOpen, unregisterModalOpen } from "../utils/modalBodyClass";

export default function EditTransactionModal({ open, transaction, onSave, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    registerModalOpen();
    return () => unregisterModalOpen();
  }, [open]);

  useEffect(() => {
    if (!open || !transaction) return;
    setAmount(String(transaction.amount ?? ""));
    setNote(transaction.note || "");
    openedAtRef.current = Date.now();
  }, [open, transaction]);

  if (!open || !transaction) return null;

  const requestClose = (afterClose) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (typeof afterClose === "function") afterClose();
      else if (onClose) onClose();
    }, 180);
  };

  const handleSave = () => {
    if (!onSave) return;
    onSave({
      id: transaction.id,
      amount: Number(amount),
      note,
    });
  };

  const typeLabel = transaction.type ? transaction.type.toUpperCase() : "TRANSACTION";
  const typeClass =
    transaction.type === "expense"
      ? "bg-rose-100 text-rose-700"
      : transaction.type === "transfer"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/40 flex items-center justify-center z-[120] ${
        isClosing ? "modal-overlay-exit" : "modal-overlay-enter"
      }`}
      onClick={() => {
        if (Date.now() - openedAtRef.current < 250) return;
        requestClose();
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-lg w-11/12 max-w-sm p-5 ${
          isClosing ? "modal-panel-exit" : "modal-panel-enter"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-800">Edit transaction</h3>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${typeClass}`}>
            {typeLabel}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Update amount or note.</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Amount</label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-200 bg-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Note</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-slate-200 bg-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => requestClose()}
            className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => requestClose(handleSave)}
            className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
