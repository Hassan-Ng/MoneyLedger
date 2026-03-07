import React from "react";

export default function AccountActionModal({
  account,
  canDelete = false,
  onClose,
  onToggleActive,
  onDelete,
  showToggleActive = true,
  onMakeTransaction,
}) {
  if (!account) return null;

  const isActive = account.active !== false;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-sm p-5">
        <h3 className="text-lg font-semibold text-slate-800">{account.name}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Created: {new Date(account.createdAt).toLocaleString()}
        </p>

        <div className="mt-4 space-y-2">
          {onMakeTransaction && (
            <button
              type="button"
              onClick={() => onMakeTransaction(account)}
              className="w-full px-3 py-2 rounded-md border border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              Make Transaction
            </button>
          )}

          {showToggleActive && (
            <button
              type="button"
              onClick={() => onToggleActive(account)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {isActive ? "Deactivate" : "Activate"}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(account)}
              className="w-full px-3 py-2 rounded-md border border-red-400 text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
