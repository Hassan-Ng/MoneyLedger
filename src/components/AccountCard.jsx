import React from "react";

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function AccountCard({ account, subtitle, onClick, showStatusDot = true }) {
  const isActive = account.active !== false;
  const balance = Number(account.balance || 0);
  const isNegative = balance < 0;
  const isClickable = typeof onClick === "function";

  const content = (
    <div
      className={`w-full rounded-2xl border border-transparent bg-white px-4 py-3 shadow-sm transition text-left ${
        isClickable ? "hover:border-slate-200" : ""
      }`}
    >
      <div className="relative flex items-center justify-between gap-3">
        {showStatusDot && (
          <span
            className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ${
              isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
            aria-label={isActive ? "Active" : "Inactive"}
            title={isActive ? "Active" : "Inactive"}
          />
        )}

        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ${
              isNegative ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {initials(account.name)}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-slate-900">{account.name}</div>
            {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
          </div>
        </div>

        <div className={`text-base font-bold ${isNegative ? "text-rose-600" : "text-emerald-600"}`}>
          {isNegative ? "-" : "+"} Rs. {Math.abs(balance).toFixed(2)}
        </div>
      </div>
    </div>
  );

  if (!isClickable) return content;

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}
