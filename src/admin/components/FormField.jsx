import {
  ImageInput,
  GalleryEditor,
  MenuEditor,
  DocumentEditor,
} from "./ContentEditors.jsx";
import MediaEditor from "./MediaEditor.jsx";
export default function FormField({
  field,
  value,
  onChange,
  error,
  disabled,
  onCover,
  legacy,
}) {
  const id = `cms-${field.key}`;
  const props = {
    id,
    name: field.key,
    disabled,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": field.hint || error ? `${id}-help` : undefined,
  };
  if (field.key === "q") return null;
  const special = {
    gallery: GalleryEditor,
    media: MediaEditor,
    menu: MenuEditor,
    document: DocumentEditor,
  };
  const Special = special[field.type];
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
          {Special ? (
            <Special
              value={value}
              onChange={onChange}
              disabled={disabled}
              onCover={onCover}
              legacy={legacy}
            />
          ) : field.type === "select" ? (
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
      {["imageUrl", "logoUrl"].includes(field.key) && (
        <ImageInput value={value} onChange={onChange} disabled={disabled} />
      )}
    </div>
  );
}
