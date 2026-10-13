import { API_URL } from "./config.js";
export class PublicApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}
export async function publicRequest(path, signal) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) cancel();
  const timer = setTimeout(cancel, 12000);
  try {
    // Public reads never access admin storage or attach authentication.
    const response = await fetch(`${API_URL}/api${path}`, {
      signal: controller.signal,
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok)
      throw new PublicApiError(
        response.status === 404
          ? "Nội dung này hiện không còn khả dụng."
          : "Không thể tải nội dung. Vui lòng thử lại sau.",
        response.status,
      );
    try {
      return await response.json();
    } catch (error) {
      if (controller.signal.aborted) throw error;
      throw new PublicApiError("Không thể tải nội dung. Vui lòng thử lại sau.");
    }
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof PublicApiError) throw error;
    throw new PublicApiError(
      "Không thể kết nối máy chủ. Vui lòng thử lại sau.",
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}
