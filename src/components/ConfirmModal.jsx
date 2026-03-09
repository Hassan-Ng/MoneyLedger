import React, { useEffect, useState } from "react";
import { registerModalOpen, unregisterModalOpen } from "../utils/modalBodyClass";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  onConfirm,
  onCancel,
}) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!open) return;
    registerModalOpen();
    return () => unregisterModalOpen();
  }, [open]);

  if (!open) return null;

  const requestClose = (afterClose) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (typeof afterClose === "function") afterClose();
      else if (onCancel) onCancel();
    }, 180);
  };

  const confirmClass =
    confirmTone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-teal-600 hover:bg-teal-700 text-white";

  return (
    <div
      className={`fixed inset-0 bg-black/40 flex items-center justify-center z-[120] ${
        isClosing ? "modal-overlay-exit" : "modal-overlay-enter"
      }`}
      onClick={() => requestClose()}
    >
      <div
        className={`bg-white rounded-xl shadow-lg w-11/12 max-w-sm p-5 ${
          isClosing ? "modal-panel-exit" : "modal-panel-enter"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {message && <p className="text-sm text-slate-500 mt-1">{message}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => requestClose()}
            className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => requestClose(onConfirm)}
            className={`px-4 py-2 rounded-md ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
