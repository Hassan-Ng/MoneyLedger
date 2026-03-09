import React, { useRef, useState } from "react";
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
  const [pageDirection, setPageDirection] = useState("forward");
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchEndRef = useRef({ x: 0, y: 0 });

  const renderPage = (pageId) => {
    switch (pageId) {
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

  const navigateTo = (targetPageId) => {
    if (targetPageId === activePage) return;
    const currentIndex = navItems.findIndex((item) => item.id === activePage);
    const targetIndex = navItems.findIndex((item) => item.id === targetPageId);
    if (targetIndex === -1 || currentIndex === -1) return;

    setPageDirection(targetIndex > currentIndex ? "forward" : "backward");
    setActivePage(targetPageId);
  };

  const handleTouchStart = (e) => {
    const touch = e.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    const touch = e.changedTouches[0];
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Trigger only clear horizontal swipes, ignore mostly vertical gestures.
    if (absX < 70 || absX <= absY * 1.2) return;

    const currentIndex = navItems.findIndex((item) => item.id === activePage);
    if (currentIndex === -1) return;

    if (deltaX < 0 && currentIndex < navItems.length - 1) {
      navigateTo(navItems[currentIndex + 1].id);
      return;
    }
    if (deltaX > 0 && currentIndex > 0) {
      navigateTo(navItems[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Page Content */}
      <div
        className="flex-1 pb-20 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={activePage}
          className={pageDirection === "forward" ? "page-enter-from-right" : "page-enter-from-left"}
        >
          {renderPage(activePage)}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm flex justify-around py-2 z-50">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => navigateTo(id)}
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
