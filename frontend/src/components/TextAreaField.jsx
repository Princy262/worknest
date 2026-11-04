// A label plus a multi-line text box.
const TextAreaField = ({ label, id, ...textareaProps }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
      {label}
    </label>
    <textarea
      id={id}
      rows={3}
      {...textareaProps}
      className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary/40"
    />
  </div>
);

export default TextAreaField;