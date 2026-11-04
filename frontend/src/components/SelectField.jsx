// A label plus a dropdown, styled like FormField.
const SelectField = ({ label, id, hint, children, ...selectProps }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
      {label}
    </label>
    <select
      id={id}
      {...selectProps}
      className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary/40 disabled:bg-background disabled:text-muted"
    >
      {children}
    </select>
    {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
  </div>
);

export default SelectField;