import { useEffect } from 'react';
import { X } from 'lucide-react';

const widths = { md: 'max-w-lg', lg: 'max-w-3xl' };

// A pop-up window. Closes with the X button or the Esc key.
const Modal = ({ title, onClose, size = 'md', children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/50" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${widths[size]} max-h-[90vh] flex flex-col bg-surface rounded-2xl shadow-xl`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-lg font-semibold text-dark">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;