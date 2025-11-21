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
      .then((reg) => console.log("Service Worker Registered", reg))
      .catch((err) => console.log("Service Worker Error", err));
  });
}
