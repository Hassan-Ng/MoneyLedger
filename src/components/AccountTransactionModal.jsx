import React, { useEffect, useMemo, useState } from "react";
import { showError, showSuccess } from "../utils/toast";

const TX_TYPES = [
  { id: "income", label: "Income", hint: "Money received" },
  { id: "expense", label: "Expense", hint: "Money sent" },
  { id: "transfer", label: "Transfer", hint: "Move between accounts" },
];

export default function AccountTransactionModal({
  account,
  accounts,
  onClose,
  onSave,
}) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("");
  const [toAccountId, setToAccountId] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const destinationAccounts = useMemo(
    () => accounts.filter((item) => item.id !== account?.id),
    [accounts, account]
  );

  useEffect(() => {
    if (!account) return;
    setStep(1);
    setType("");
    setToAccountId(null);
    setAmount("");
    setNote("");
  }, [account]);

  if (!account) return null;

  const goToAmountStep = () => setStep(3);

  const handleSave = async () => {
    if (!type || !amount) return;
    if (type === "transfer" && !toAccountId) return;

    try {
      await onSave({
        accountId: account.id,
        type,
        amount: Number(amount),
        note,
        toAccountId: type === "transfer" ? toAccountId : undefined,
      });
      showSuccess("Transaction saved.");
      onClose();
    } catch (error) {
      showError(error?.message || "Could not save transaction.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
      <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-md p-5">
        <h3 className="text-lg font-semibold text-slate-800">Make Transaction</h3>
        <p className="text-xs text-slate-500 mt-1">{account.name}</p>

        {step === 1 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-slate-700">Select Type</div>
            <div className="grid grid-cols-1 gap-2">
              {TX_TYPES.map((txType) => (
                <button
                  key={txType.id}
                  type="button"
                  onClick={() => {
                    setType(txType.id);
                    if (txType.id === "transfer") setStep(2);
                    else goToAmountStep();
                  }}
                  className="border border-slate-200 rounded-lg p-3 text-left hover:border-teal-500 hover:bg-teal-50 transition"
                >
                  <div className="font-semibold text-slate-800">{txType.label}</div>
                  <div className="text-xs text-slate-500">{txType.hint}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-slate-700">Select Destination Account</div>
            {destinationAccounts.length === 0 ? (
              <div className="text-sm text-slate-500 border rounded-lg p-3">
                No other accounts available for transfer.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-auto pr-1">
                {destinationAccounts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setToAccountId(item.id);
                      goToAmountStep();
                    }}
                    className="border border-slate-200 rounded-lg p-3 text-left hover:border-teal-500 hover:bg-teal-50 transition"
                  >
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      Rs. {Number(item.balance || 0).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-slate-600">
              {type.toUpperCase()}
              {type === "transfer" && toAccountId
                ? ` -> ${accounts.find((item) => item.id === toAccountId)?.name || ""}`
                : ""}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 1) onClose();
              else if (step === 3 && type === "transfer") setStep(2);
              else setStep(1);
            }}
            className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100"
          >
            {step === 1 ? "Close" : "Back"}
          </button>

          {step === 3 ? (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Save
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
