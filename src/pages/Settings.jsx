import React from "react";

export default function Settings() {
  // Function to clear all localStorage data
  const handleClearData = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all data? This action cannot be undone."
    );
    if (confirmClear) {
      localStorage.clear();
      alert("✅ All app data has been cleared!");
      // Optional: reload the page to reset app state
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Settings</h2>

      <div className="mt-4">
        <button
          onClick={handleClearData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
