import Modal from './Modal';

// "Are you sure?" window. The confirm button uses the dark red from your status palette.
const ConfirmDialog = ({ title, message, confirmLabel, busy, onConfirm, onCancel }) => (
  <Modal title={title} onClose={onCancel}>
    <p className="text-sm text-ink mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="rounded-lg border border-line text-ink hover:bg-background text-sm font-medium px-5 py-2.5"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={busy}
        className="rounded-lg bg-status-inactive-text hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5"
      >
        {busy ? 'Working...' : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;