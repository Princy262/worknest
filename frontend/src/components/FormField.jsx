// A label plus an input. "children" lets a parent add something on the right (like Show/Hide).
const FormField = ({ label, id, children, ...inputProps }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        {...inputProps}
        className={`w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary/40 ${
          children ? 'pr-16' : ''
        }`}
      />
      {children}
    </div>
  </div>
);

export default FormField;