import React, { useState } from "react";
import {
  Home,
  Wallet,
  List,
  BarChart2,
  Settings as SettingsIcon,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Summary from "./pages/Summary";
import Settings from "./pages/Settings";

export default function MainAreaRouter() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "accounts":
        return <Accounts />;
      case "transactions":
        return <Transactions />;
      case "summary":
        return <Summary />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "accounts", icon: Wallet, label: "Accounts" },
    { id: "transactions", icon: List, label: "Transactions" },
    { id: "summary", icon: BarChart2, label: "Groups" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Page Content */}
      <div className="flex-1">{renderPage()}</div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm flex justify-around py-2 z-50">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            className={`flex flex-col items-center justify-center text-xs ${
              activePage === id ? "text-teal-600" : "text-slate-500"
            }`}
          >
            <Icon
              size={22}
              className={`mb-0.5 ${
                activePage === id ? "text-teal-600" : "text-slate-400"
              }`}
            />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
