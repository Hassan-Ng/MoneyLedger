import React, { useEffect, useRef, useState } from "react";
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
  const [dragToPage, setDragToPage] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const contentRef = useRef(null);
  const settleTimerRef = useRef(null);
  const gestureRef = useRef({ startX: 0, startY: 0, mode: "idle" });

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

  useEffect(() => {
    const updateWidth = () => {
      setPageWidth(contentRef.current?.offsetWidth || window.innerWidth || 0);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const renderScene = (pageId) => (
    <div className="h-full flex flex-col">
      <header className="mb-4 flex items-center justify-between px-4 md:px-8 pt-4">
        <h1 className="text-2xl font-bold text-teal-700">SparkPair · BizLedger</h1>
        <span className="text-xs text-slate-500">Offline PWA</span>
      </header>
      <div className="flex-1 px-4 md:px-8 pb-20">{renderPage(pageId)}</div>
    </div>
  );

  const getDirectionSign = (fromPageId, toPageId) => {
    const fromIndex = navItems.findIndex((item) => item.id === fromPageId);
    const toIndex = navItems.findIndex((item) => item.id === toPageId);
    if (fromIndex === -1 || toIndex === -1) return 0;
    return toIndex > fromIndex ? -1 : 1;
  };

  const settleSlide = (shouldNavigate) => {
    if (!dragToPage) return;
    const directionSign = getDirectionSign(activePage, dragToPage);
    const width = pageWidth || window.innerWidth || 0;

    setIsDragging(false);
    setIsSettling(true);
    setDragOffset(shouldNavigate ? directionSign * width : 0);

    settleTimerRef.current = setTimeout(() => {
      if (shouldNavigate) setActivePage(dragToPage);
      setDragToPage(null);
      setDragOffset(0);
      setIsSettling(false);
    }, 300);
  };

  const navigateTo = (targetPageId) => {
    if (targetPageId === activePage || isSettling) return;
    const currentIndex = navItems.findIndex((item) => item.id === activePage);
    const targetIndex = navItems.findIndex((item) => item.id === targetPageId);
    if (targetIndex === -1 || currentIndex === -1) return;

    const width = pageWidth || window.innerWidth || 0;
    const directionSign = targetIndex > currentIndex ? -1 : 1;

    setDragToPage(targetPageId);
    setDragOffset(0);
    setIsDragging(false);
    setIsSettling(true);
    requestAnimationFrame(() => {
      setDragOffset(directionSign * width);
    });

    settleTimerRef.current = setTimeout(() => {
      setActivePage(targetPageId);
      setDragToPage(null);
      setDragOffset(0);
      setIsSettling(false);
    }, 300);
  };

  const handleTouchStart = (e) => {
    if (isSettling) return;
    const touch = e.changedTouches[0];
    gestureRef.current = { startX: touch.clientX, startY: touch.clientY, mode: "undecided" };
  };

  const handleTouchMove = (e) => {
    if (isSettling) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - gestureRef.current.startX;
    const deltaY = touch.clientY - gestureRef.current.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (gestureRef.current.mode === "undecided" && (absX > 10 || absY > 10)) {
      gestureRef.current.mode = absX > absY * 1.1 ? "horizontal" : "vertical";
    }

    if (gestureRef.current.mode !== "horizontal") return;

    const currentIndex = navItems.findIndex((item) => item.id === activePage);
    if (currentIndex === -1) return;

    const nextPage = deltaX < 0 ? navItems[currentIndex + 1]?.id : navItems[currentIndex - 1]?.id;
    if (!nextPage) {
      setDragToPage(null);
      setIsDragging(false);
      setDragOffset(deltaX * 0.2);
      return;
    }

    const width = pageWidth || window.innerWidth || 0;
    const clamped = Math.max(-width, Math.min(width, deltaX));

    setDragToPage(nextPage);
    setIsDragging(true);
    setDragOffset(clamped);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !dragToPage) {
      setDragOffset(0);
      setIsDragging(false);
      setDragToPage(null);
      gestureRef.current.mode = "idle";
      return;
    }

    const width = pageWidth || window.innerWidth || 0;
    const threshold = width * 0.22;
    const shouldNavigate = Math.abs(dragOffset) > threshold;
    settleSlide(shouldNavigate);
    gestureRef.current.mode = "idle";
  };

  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Page Content */}
      <div
        ref={contentRef}
        className="flex-1 pb-20 overflow-hidden"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!dragToPage ? (
          <div key={activePage} className="h-full">
            {renderScene(activePage)}
          </div>
        ) : (
          <div className="relative h-full">
            <div
              className="absolute inset-0"
              style={{
                transform: `translateX(${dragOffset}px)`,
                transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1)",
              }}
            >
              {renderScene(activePage)}
            </div>
            <div
              className="absolute inset-0"
              style={{
                transform: `translateX(${
                  dragOffset + (getDirectionSign(activePage, dragToPage) === -1 ? pageWidth : -pageWidth)
                }px)`,
                transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1)",
              }}
            >
              {renderScene(dragToPage)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm flex justify-around py-2 z-50">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => navigateTo(id)}
            className={`flex flex-col items-center justify-center text-xs ${
              (dragToPage ? dragToPage : activePage) === id ? "text-teal-600" : "text-slate-500"
            }`}
          >
            <Icon
              size={22}
              className={`mb-0.5 ${
                (dragToPage ? dragToPage : activePage) === id ? "text-teal-600" : "text-slate-400"
              }`}
            />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
