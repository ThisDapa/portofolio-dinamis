"use client";
import { useEffect, useRef } from "react";
export function DeleteConfirmation({ busy, name, error, onConfirm, onCancel }) {
  const dialog = useRef(null);
  useEffect(function openDialog() {
    const element = dialog.current;
    element?.showModal();
    return function closeDialog() {
      element?.close();
    };
  }, []);
  return (
    <dialog
      className="delete-dialog"
      ref={dialog}
      aria-labelledby="delete-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id="delete-title">Hapus {name}?</h2>
      <p>
        Data ini akan dihapus permanen. Pilih Batal jika ingin menyimpannya.
      </p>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="actions">
        <button
          className="button"
          disabled={busy}
          onClick={() => {
            onConfirm();
          }}
        >
          {busy ? "Menghapus…" : "Ya, hapus"}
        </button>
        <button
          className="text-button"
          autoFocus
          disabled={busy}
          onClick={() => {
            onCancel();
          }}
        >
          Batal
        </button>
      </div>
    </dialog>
  );
}
