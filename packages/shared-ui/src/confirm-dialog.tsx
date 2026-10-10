import { useEffect, useId, useRef } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Hủy",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      }
      cancelRef.current?.focus();
    } else if (dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="bang-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id={titleId}>{title}</h2>
      <p id={descriptionId}>{description}</p>
      <div className="bang-dialog__actions">
        <button ref={cancelRef} className="bang-button" type="button" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button className="bang-button bang-button--danger" type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
