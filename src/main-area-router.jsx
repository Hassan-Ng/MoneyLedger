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

const SETTLE_MS = 300;
const PAGE_LOAD_DELAY_MS = 120;

const MemoDashboard = React.memo(Dashboard);
const MemoAccounts = React.memo(Accounts);
const MemoTransactions = React.memo(Transactions);
const MemoSummary = React.memo(Summary);
const MemoSettings = React.memo(Settings);

export default function MainAreaRouter() {
  const [activePage, setActivePage] = useState("dashboard");
  const [renderedPage, setRenderedPage] = useState("dashboard");
  const [dragToPage, setDragToPage] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);

  const contentRef = useRef(null);
  const settleTimerRef = useRef(null);
  const pageLoadTimerRef = useRef(null);
  const pointerRef = useRef({
    id: null,
    startX: 0,
    startY: 0,
    startAt: 0,
    mode: "idle",
  });

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "accounts", icon: Wallet, label: "Accounts" },
    { id: "transactions", icon: List, label: "Transactions" },
    { id: "summary", icon: BarChart2, label: "Groups" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const renderPage = (pageId) => {
    switch (pageId) {
      case "dashboard":
        return <MemoDashboard />;
      case "accounts":
        return <MemoAccounts />;
      case "transactions":
        return <MemoTransactions />;
      case "summary":
        return <MemoSummary />;
      case "settings":
        return <MemoSettings />;
      default:
        return <MemoDashboard />;
    }
  };

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
      if (pageLoadTimerRef.current) clearTimeout(pageLoadTimerRef.current);
    };
  }, []);

  const commitPageNavigation = (nextPageId) => {
    if (!nextPageId) return;
    if (pageLoadTimerRef.current) clearTimeout(pageLoadTimerRef.current);

    setActivePage(nextPageId);
    setIsPageLoading(true);
    pageLoadTimerRef.current = setTimeout(() => {
      setRenderedPage(nextPageId);
      setIsPageLoading(false);
    }, PAGE_LOAD_DELAY_MS);
  };

  const renderLoadingState = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 w-36 rounded-md bg-slate-200" />
      <div className="h-24 rounded-2xl bg-slate-200" />
      <div className="h-20 rounded-2xl bg-slate-200" />
      <div className="h-20 rounded-2xl bg-slate-200" />
    </div>
  );

  const renderScene = (pageId) => (
    <div className="min-h-full flex flex-col">
      <header className="mb-4 flex items-center justify-between px-4 md:px-8 pt-4">
        <h1 className="text-2xl font-bold text-teal-700">SparkPair · BizLedger</h1>
        <span className="text-xs text-slate-500">Offline PWA</span>
      </header>
      <div className="flex-1 px-4 md:px-8 pb-20">{renderPage(pageId)}</div>
    </div>
  );

  const renderSceneSkeleton = () => (
    <div className="min-h-full flex flex-col">
      <header className="mb-4 flex items-center justify-between px-4 md:px-8 pt-4">
        <h1 className="text-2xl font-bold text-teal-700">SparkPair · BizLedger</h1>
        <span className="text-xs text-slate-500">Offline PWA</span>
      </header>
      <div className="flex-1 px-4 md:px-8 pb-20">{renderLoadingState()}</div>
    </div>
  );

  const getDirectionSign = (fromPageId, toPageId) => {
    const fromIndex = navItems.findIndex((item) => item.id === fromPageId);
    const toIndex = navItems.findIndex((item) => item.id === toPageId);
    if (fromIndex === -1 || toIndex === -1) return 0;
    return toIndex > fromIndex ? -1 : 1;
  };

  const resetDrag = () => {
    setDragOffset(0);
    setIsDragging(false);
    setDragToPage(null);
  };

  const resetPointer = () => {
    pointerRef.current = {
      id: null,
      startX: 0,
      startY: 0,
      startAt: 0,
      mode: "idle",
    };
  };

  const settleSlide = (shouldNavigate) => {
    if (!dragToPage) {
      resetDrag();
      return;
    }

    const directionSign = getDirectionSign(activePage, dragToPage);
    const width = pageWidth || window.innerWidth || 0;

    setIsDragging(false);
    setIsSettling(true);
    setDragOffset(shouldNavigate ? directionSign * width : 0);

    settleTimerRef.current = setTimeout(() => {
      if (shouldNavigate) commitPageNavigation(dragToPage);
      resetDrag();
      setIsSettling(false);
    }, SETTLE_MS);
  };

  const animateTabNavigate = (targetPageId) => {
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
      commitPageNavigation(targetPageId);
      resetDrag();
      setIsSettling(false);
    }, SETTLE_MS);
  };

  const handlePointerDown = (e) => {
    if (e.pointerType !== "touch" || isSettling) return;

    if (isDragging || dragToPage) {
      resetDrag();
    }

    pointerRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startAt: Date.now(),
      mode: "undecided",
    };
  };

  const handlePointerMove = (e) => {
    const state = pointerRef.current;
    if (e.pointerType !== "touch" || state.id !== e.pointerId || isSettling) return;

    const deltaX = e.clientX - state.startX;
    const deltaY = e.clientY - state.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (state.mode === "undecided" && (absX > 10 || absY > 10)) {
      // Keep undecided a bit longer on scrollable pages to avoid false vertical locks.
      if (absX > absY + 6) state.mode = "horizontal";
      else if (absY > absX + 10) state.mode = "vertical";
    }

    if (state.mode !== "horizontal") return;

    if (contentRef.current && !contentRef.current.hasPointerCapture(e.pointerId)) {
      contentRef.current.setPointerCapture(e.pointerId);
    }

    const currentIndex = navItems.findIndex((item) => item.id === activePage);
    if (currentIndex === -1) return;

    const nextPage = deltaX < 0 ? navItems[currentIndex + 1]?.id : navItems[currentIndex - 1]?.id;

    if (!nextPage) {
      setDragToPage(null);
      setIsDragging(false);
      setDragOffset(deltaX * 0.18);
      return;
    }

    const width = pageWidth || window.innerWidth || 0;
    const clamped = Math.max(-width, Math.min(width, deltaX));

    setDragToPage(nextPage);
    setIsDragging(true);
    setDragOffset(clamped);
  };

  const finalizeSwipe = (cancelled = false) => {
    const state = pointerRef.current;

    if (cancelled || !isDragging || !dragToPage || state.mode !== "horizontal") {
      if (cancelled && settleTimerRef.current) clearTimeout(settleTimerRef.current);
      resetDrag();
      if (cancelled) setIsSettling(false);
      resetPointer();
      return;
    }

    const width = pageWidth || window.innerWidth || 0;
    const duration = Date.now() - state.startAt;
    const threshold = Math.max(32, width * 0.12);
    const isQuickFling = Math.abs(dragOffset) > 18 && duration < 260;
    const shouldNavigate = Math.abs(dragOffset) > threshold || isQuickFling;

    settleSlide(shouldNavigate);
    resetPointer();
  };

  const handlePointerUp = (e) => {
    if (e.pointerType !== "touch" || pointerRef.current.id !== e.pointerId) return;
    if (contentRef.current && contentRef.current.hasPointerCapture(e.pointerId)) {
      contentRef.current.releasePointerCapture(e.pointerId);
    }
    finalizeSwipe(false);
  };

  const handlePointerCancel = (e) => {
    if (e.pointerType !== "touch" || pointerRef.current.id !== e.pointerId) return;
    finalizeSwipe(true);
  };

  const indicatorPage = dragToPage || activePage;

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <div
        ref={contentRef}
        className="relative flex-1 pb-20 overflow-x-hidden"
        style={{ touchAction: "pan-y" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {!dragToPage ? (
          <div key={activePage} className="min-h-full">
            {isPageLoading || renderedPage !== activePage
              ? renderSceneSkeleton()
              : renderScene(renderedPage)}
          </div>
        ) : (
          <div className="relative min-h-full">
            <div
              className="absolute inset-y-0 left-0 w-full"
              style={{
                transform: `translateX(${dragOffset}px)`,
                transition: isDragging
                  ? "none"
                  : `transform ${SETTLE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
              }}
            >
              {renderScene(activePage)}
            </div>
            <div
              className="absolute inset-y-0 left-0 w-full"
              style={{
                transform: `translateX(${dragOffset + (getDirectionSign(activePage, dragToPage) === -1 ? pageWidth : -pageWidth)}px)`,
                transition: isDragging
                  ? "none"
                  : `transform ${SETTLE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
              }}
            >
              {renderSceneSkeleton()}
            </div>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm flex justify-around py-2 z-50">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => animateTabNavigate(id)}
            className={`flex flex-col items-center justify-center text-xs ${
              indicatorPage === id ? "text-teal-600" : "text-slate-500"
            }`}
          >
            <Icon
              size={22}
              className={`mb-0.5 ${indicatorPage === id ? "text-teal-600" : "text-slate-400"}`}
            />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
