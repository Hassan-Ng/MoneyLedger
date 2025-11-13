// Very small toast helpers using DOM (no dependency)
export function showSuccess(msg) {
  spawnToast(msg, "bg-green-600");
}
export function showError(msg) {
  spawnToast(msg, "bg-red-600");
}

function spawnToast(msg, color = "bg-slate-800") {
  const root = document.createElement("div");
  root.className = `fixed right-4 bottom-24 z-50`;
  const el = document.createElement("div");
  el.className = `${color} text-white px-4 py-2 rounded-md shadow-md`;
  el.textContent = msg;
  root.appendChild(el);
  document.body.appendChild(root);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => document.body.removeChild(root), 300);
  }, 2000);
}
