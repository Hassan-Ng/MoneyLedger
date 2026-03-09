let modalCount = 0;

export function registerModalOpen() {
  if (typeof document === "undefined") return;
  modalCount += 1;
  document.body.classList.add("modal-open");
}

export function unregisterModalOpen() {
  if (typeof document === "undefined") return;
  modalCount = Math.max(0, modalCount - 1);
  if (modalCount === 0) {
    document.body.classList.remove("modal-open");
  }
}
