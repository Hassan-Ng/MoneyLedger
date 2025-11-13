import React from "react";

export default function BottomNav({ active = "dashboard", onNavigate = () => {} }) {
  // Using window.location.hash or optional router is fine; here we pass a callback
  const items = [
    { key: "dashboard", label: "Home", svg: HomeIcon },
    { key: "accounts", label: "Accounts", svg: WalletIcon },
    { key: "transactions", label: "Transactions", svg: ListIcon },
    { key: "summary", label: "Summary", svg: ChartIcon },
    { key: "settings", label: "Settings", svg: CogIcon },
  ];

  return (
    <nav className="fixed left-0 right-0 bottom-3 px-4 sm:px-8">
      <div className="bg-white rounded-2xl shadow-lg px-3 py-2 flex justify-between items-center">
        {items.map((it) => {
          const ActiveIcon = it.svg;
          const isActive = it.key === active;
          return (
            <button key={it.key} onClick={() => onNavigate(it.key)} className="flex flex-col items-center text-xs">
              <ActiveIcon active={isActive} />
              <span className={`mt-1 ${isActive ? "text-teal-700 font-semibold" : "text-slate-500"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Simple SVG icon components
function HomeIcon({ active }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? "text-teal-700" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
    </svg>
  );
}
function WalletIcon({ active }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? "text-teal-700" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18v10H3z" />
    </svg>
  );
}
function ListIcon({ active }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? "text-teal-700" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function ChartIcon({ active }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? "text-teal-700" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 12h6M4 6v12" />
    </svg>
  );
}
function CogIcon({ active }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${active ? "text-teal-700" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317a9 9 0 019.358 9.358M6.25 11.5a3.75 3.75 0 107.5 0 3.75 3.75 0 00-7.5 0z" />
    </svg>
  );
}
