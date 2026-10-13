import { useEffect, useRef, useState } from "react";
import { adminApi } from "../api/adminApi.js";
import { settingFields, validateDraft } from "../forms.js";
import FormField from "../components/FormField.jsx";
import { Feedback, LoadingState } from "../components/Feedback.jsx";
export default function SettingsPage() {
  const [values, setValues] = useState(null),
    [initial, setInitial] = useState(null),
    [errors, setErrors] = useState({}),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false),
    [reload, setReload] = useState(0);
  const form = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    setValues(null);
    setError("");
    adminApi
      .settings(controller.signal)
      .then((data) => {
        const values = Object.fromEntries(
          settingFields.map((field) => [field.key, data[field.key] || ""]),
        );
        setValues(values);
        setInitial(values);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error);
      });
    return () => controller.abort();
  }, [reload]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const errors = validateDraft(settingFields, values);
    setErrors(errors);
    if (Object.keys(errors).length) {
      requestAnimationFrame(() =>
        form.current?.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    const changed = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => initial[key] !== value),
    );
    if (!Object.keys(changed).length) {
      setSuccess("Chưa có thay đổi cần lưu.");
      return;
    }
    setBusy(true);
    try {
      const data = await adminApi.saveSettings(changed);
      const saved = Object.fromEntries(
        settingFields.map((field) => [field.key, data[field.key] || ""]),
      );
      setValues(saved);
      setInitial(saved);
      setSuccess("Lưu thay đổi thành công.");
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="cms-page-heading">
        <div>
          <p className="cms-eyebrow">THÔNG TIN WEBSITE</p>
          <h1>Cài đặt</h1>
          <p className="cms-description">
            Cập nhật kênh liên hệ, địa chỉ và thông tin giới thiệu.
          </p>
        </div>
      </div>
      <Feedback error={error} success={success} />
      {!values ? (
        error ? (
          <button
            className="cms-button cms-secondary"
            onClick={() => setReload((value) => value + 1)}
          >
            Thử lại
          </button>
        ) : (
          <LoadingState />
        )
      ) : (
        <section className="cms-panel">
          <h2>Thông tin chung</h2>
          <p className="cms-help">
            Giữ placeholder nếu chưa có thông tin chính thức. Zalo và Facebook
            là liên kết liên hệ.
          </p>
          <form ref={form} onSubmit={submit} noValidate>
            <div className="cms-form-grid">
              {settingFields.map((field) => (
                <FormField
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  error={errors[field.key]}
                  disabled={busy}
                  onChange={(value) => {
                    setValues((current) => ({
                      ...current,
                      [field.key]: value,
                    }));
                    setErrors((current) => ({ ...current, [field.key]: "" }));
                  }}
                />
              ))}
            </div>
            <div className="cms-form-actions">
              <button className="cms-button cms-primary" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                className="cms-button cms-secondary"
                disabled={busy}
                onClick={() => {
                  setValues(initial);
                  setErrors({});
                  setError("");
                  setSuccess("");
                }}
              >
                Hoàn tác chỉnh sửa
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
