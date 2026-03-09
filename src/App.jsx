import React from "react";
import MainAreaRouter from "./main-area-router";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-4xl mx-auto">
        <MainAreaRouter />
      </div>
    </div>
  );
}
