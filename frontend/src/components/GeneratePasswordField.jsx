import { useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import {
  generatePassword,
  DEFAULT_PASSWORD_OPTIONS,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from '../utils/passwordGenerator';

const GROUPS = [
  ['uppercase', 'A-Z'],
  ['lowercase', 'a-z'],
  ['numbers', '0-9'],
  ['symbols', '!@#'],
];

// The temporary-password input with your generator built in.
const GeneratePasswordField = ({ value, onChange }) => {
  const [options, setOptions] = useState(DEFAULT_PASSWORD_OPTIONS);
  const [copied, setCopied] = useState(false);

  const regenerate = (nextOptions) => {
    onChange(generatePassword(nextOptions));
    setCopied(false);
  };

  const updateOptions = (changes) => {
    const next = { ...options, ...changes };
    // At least one group must stay switched on
    if (!next.uppercase && !next.lowercase && !next.numbers && !next.symbols) return;
    setOptions(next);
    regenerate(next);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copying can be blocked by the browser. The password is still visible to copy by hand.
    }
  };

  const smallButton =
    'flex items-center gap-1.5 rounded-lg border border-line text-ink hover:bg-background text-sm font-medium px-3 py-2';

  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
        Temporary password
      </label>

      <div className="flex gap-2">
        <input
          id="password"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm font-mono text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary/40"
        />
        <button type="button" onClick={() => regenerate(options)} className={smallButton}>
          <RefreshCw size={15} />
          Generate
        </button>
        <button type="button" onClick={copy} className={smallButton}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-ink">
        <label className="flex items-center gap-2">
          Length {options.length}
          <input
            type="range"
            min={MIN_PASSWORD_LENGTH}
            max={MAX_PASSWORD_LENGTH}
            value={options.length}
            onChange={(e) => updateOptions({ length: Number(e.target.value) })}
            className="accent-primary"
          />
        </label>
        {GROUPS.map(([name, label]) => (
          <label key={name} className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={options[name]}
              onChange={(e) => updateOptions({ [name]: e.target.checked })}
              className="accent-primary"
            />
            {label}
          </label>
        ))}
      </div>

      <p className="text-xs text-muted mt-2">
        The employee must change this the first time they log in.
      </p>
    </div>
  );
};

export default GeneratePasswordField;