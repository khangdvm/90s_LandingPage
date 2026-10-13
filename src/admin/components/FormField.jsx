import ImagePreview from "./ImagePreview.jsx";
export default function FormField({ field, value, onChange, error, disabled }) {
  const id = `cms-${field.key}`;
  const props = {
    id,
    name: field.key,
    disabled,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": field.hint || error ? `${id}-help` : undefined,
  };
  return (
    <div
      className={`cms-field ${["textarea", "lines"].includes(field.type) ? "cms-wide" : ""}`}
    >
      {field.type === "checkbox" ? (
        <label className="cms-checkbox">
          <input
            {...props}
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.label}
        </label>
      ) : (
        <>
          <label htmlFor={id}>
            {field.label}
            {field.required && <span aria-hidden="true"> *</span>}
          </label>
          {field.type === "select" ? (
            <select
              {...props}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              {field.options.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          ) : ["textarea", "lines"].includes(field.type) ? (
            <textarea
              {...props}
              rows={field.large ? 10 : 4}
              maxLength={20000}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          ) : (
            <input
              {...props}
              type={field.type}
              step={field.type === "number" ? 1 : undefined}
              min={field.min}
              max={field.max}
              maxLength={field.maxLength || 20000}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </>
      )}
      <div id={`${id}-help`}>
        {field.hint && <p className="cms-help">{field.hint}</p>}
        {error && <p className="cms-field-error">{error}</p>}
      </div>
      {field.key === "imageUrl" && <ImagePreview value={value} />}
    </div>
  );
}
