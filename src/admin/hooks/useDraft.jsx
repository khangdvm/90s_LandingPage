import { useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { getToken } from "../auth/auth.js";
export function useDraft(
  scope,
  value,
  initial,
  setValue,
  version = "",
  uploading = false,
) {
  const [account] = useState(() => {
    try {
      return JSON.parse(
        atob(getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ).sub;
    } catch {
      return "unknown";
    }
  });
  const key = "90s.draft." + account + "." + scope;
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  });
  const dirty =
    initial !== null && JSON.stringify(value) !== JSON.stringify(initial);
  const changed = useRef(false);
  const skip = useRef(false),
    prompted = useRef(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    if (!dirty) skip.current = false;
  }, [dirty]);
  const blocker = useBlocker(
    ({ nextLocation }) =>
      (dirty || uploading) &&
      !skip.current &&
      !nextLocation.pathname.includes("/admin/login") &&
      !!getToken(),
  );
  useEffect(() => {
    if (blocker.state !== "blocked") {
      prompted.current = false;
      return;
    }
    if (!prompted.current) {
      prompted.current = true;
      if (
        window.confirm(
          "Có thay đổi chưa lưu. Rời trang và giữ bản nháp để khôi phục?",
        )
      )
        blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (!dirty && changed.current && !saved) {
      try {
        localStorage.removeItem(key);
      } catch {}
      changed.current = false;
    }
    if (dirty && !skip.current) {
      changed.current = true;
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ value, version, at: new Date().toISOString() }),
        );
      } catch {
        setStorageError(
          "Trình duyệt không lưu được bản nháp. Không đóng tab trước khi lưu hoặc sao chép nội dung.",
        );
      }
    }
  }, [key, value, dirty, version, saved]);
  useEffect(() => {
    const warn = (e) => {
      if ((dirty || uploading) && !skip.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploading]);
  function clear() {
    skip.current = true;
    try {
      localStorage.removeItem(key);
    } catch {}
    setSaved(null);
  }
  function discard() {
    if (!(dirty || uploading) || window.confirm("Bỏ các thay đổi chưa lưu?")) {
      clear();
      return true;
    }
    return false;
  }
  const recovery = saved ? (
    <div className="cms-draft" role="status">
      <p>
        Có bản nháp lưu lúc {new Date(saved.at).toLocaleString("vi-VN")}.
        {saved.version !== version
          ? " Dữ liệu trên máy chủ đã thay đổi; hãy đối chiếu trước khi lưu."
          : ""}
      </p>
      <button
        type="button"
        onClick={() => {
          // Older drafts may predate newly added fields. Keep current defaults
          // for those fields and ignore keys the current editor no longer uses.
          setValue(
            Object.fromEntries(
              Object.keys(initial || {}).map((field) => [
                field,
                Object.hasOwn(saved.value || {}, field)
                  ? saved.value[field]
                  : initial[field],
              ]),
            ),
          );
          setSaved(null);
        }}
      >
        Khôi phục bản nháp
      </button>
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.removeItem(key);
          } catch {}
          setSaved(null);
        }}
      >
        Bỏ bản nháp
      </button>
    </div>
  ) : null;
  return {
    dirty,
    clear,
    discard,
    recovery: (
      <>
        {storageError && <p role="alert">{storageError}</p>}
        {recovery}
      </>
    ),
  };
}
