import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LedgerProvider } from "./context/LedgerContext";
import "./index.css";

// 🧠 Root Render
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LedgerProvider>
      <App />
    </LedgerProvider>
  </React.StrictMode>
);

// ⚙️ Register service worker for PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("✅ Service Worker registered"))
      .catch((err) => console.log("❌ SW registration failed:", err));
  });
}
