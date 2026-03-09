import React from "react";
import MainAreaRouter from "./main-area-router";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-teal-700">SparkPair · BizLedger</h1>
          <span className="text-xs text-slate-500">Offline PWA</span>
        </header>

        {/* Main App Area (handles all pages + bottom nav) */}
        <MainAreaRouter />
      </div>
    </div>
  );
}
