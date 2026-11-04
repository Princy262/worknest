import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// One "label / value / Copy" line, used in the "account created" windows.
const CopyRow = ({ label, value, mono }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Blocked by the browser: the value is still visible to copy by hand.
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className={`text-sm font-medium text-ink break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 flex items-center gap-1.5 rounded-lg border border-line text-ink hover:bg-background text-xs font-medium px-3 py-1.5"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

export default CopyRow;