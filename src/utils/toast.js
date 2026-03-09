export function showSuccess(msg) {
  spawnToast(msg, "success");
}
export function showError(msg) {
  spawnToast(msg, "error");
}

function getToastRoot() {
  const rootId = "app-toast-root";
  let root = document.getElementById(rootId);
  if (root) return root;

  root = document.createElement("div");
  root.id = rootId;
  root.className = "fixed top-4 left-1/2 -translate-x-1/2 z-[120] flex flex-col gap-2 items-center pointer-events-none";
  document.body.appendChild(root);
  return root;
}

function spawnToast(msg, type = "success") {
  const root = getToastRoot();
  const el = document.createElement("div");
  const accentClass = type === "error" ? "bg-rose-500" : "bg-emerald-500";
  const label = type === "error" ? "Error" : "Success";

  el.className =
    "toast-in pointer-events-auto min-w-[240px] max-w-[92vw] rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg";

  const row = document.createElement("div");
  row.className = "flex items-center gap-3";

  const dot = document.createElement("span");
  dot.className = `h-2.5 w-2.5 rounded-full ${accentClass} shrink-0`;

  const textWrap = document.createElement("div");
  textWrap.className = "min-w-0";

  const title = document.createElement("div");
  title.className = "text-xs font-semibold text-slate-700";
  title.textContent = label;

  const body = document.createElement("div");
  body.className = "text-sm text-slate-800 truncate";
  body.textContent = msg;

  textWrap.appendChild(title);
  textWrap.appendChild(body);
  row.appendChild(dot);
  row.appendChild(textWrap);
  el.appendChild(row);
  root.appendChild(el);

  setTimeout(() => {
    el.classList.remove("toast-in");
    el.classList.add("toast-out");
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (root.childElementCount === 0 && root.parentNode) {
        root.parentNode.removeChild(root);
      }
    }, 180);
  }, 2600);
}
