import { clearSession, getToken } from "../auth/auth.js";
const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
const labels = {
  name: "Tên phòng",
  slug: "Đường dẫn",
  price: "Giá",
  maxGuests: "Sức chứa",
  title: "Tiêu đề",
  category: "Chuyên mục",
  imageUrl: "Ảnh",
  ctaTarget: "Liên kết nút",
  section: "Nhóm nội dung",
  sortOrder: "Thứ tự",
  count: "Số phòng hiển thị",
  q: "Ô ảnh",
  publishedAt: "Ngày đăng",
  hotline: "Hotline",
  zaloUrl: "Zalo",
  facebookUrl: "Facebook",
  mapUrl: "Bản đồ",
  dishes: "Danh sách món",
};
export class ApiError extends Error {
  constructor(message, status = 0, detail = "") {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}
function errorMessage(status, detail) {
  if (detail === "Invalid email or password")
    return "Email hoặc mật khẩu không đúng.";
  if (status === 401)
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 409)
    return "Đường dẫn này đã tồn tại. Vui lòng chọn đường dẫn khác.";
  if (status === 404)
    return "Nội dung không còn tồn tại. Vui lòng tải lại danh sách.";
  if (status === 429)
    return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.";
  if (status === 403)
    return "Không được phép kết nối API từ địa chỉ website này.";
  if (status === 413)
    return "Nội dung gửi lên quá lớn. Vui lòng rút ngắn nội dung.";
  if (status >= 500) return "Máy chủ gặp lỗi. Vui lòng thử lại sau.";
  const field =
    /^(?:Invalid field|Required field|Invalid config|Invalid URL): (.+)$/.exec(
      detail,
    )?.[1];
  if (field) return `Vui lòng kiểm tra ${labels[field] || field}.`;
  if (detail === "Invalid hotline") return "Hotline không hợp lệ.";
  if (detail === "Invalid login payload")
    return "Vui lòng kiểm tra email và mật khẩu.";
  return detail
    ? `Không thể thực hiện yêu cầu. API: ${detail}`
    : "Không thể thực hiện yêu cầu.";
}
export async function apiRequest(
  path,
  { method = "GET", body, signal, authenticated = true } = {},
) {
  const token = authenticated ? getToken() : null;
  if (authenticated && !token) {
    clearSession("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    throw new ApiError(
      "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      401,
    );
  }
  let response;
  try {
    response = await fetch(`${API_URL}/api/admin${path}`, {
      method,
      signal,
      credentials: "omit",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.",
    );
  }
  if (response.status === 401 && authenticated && getToken() === token)
    clearSession("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  let text;
  try {
    text = await response.text();
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Không thể nhận dữ liệu từ máy chủ. Vui lòng thử lại.");
  }
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (response.ok)
      throw new ApiError(
        "Máy chủ trả về dữ liệu không hợp lệ.",
        response.status,
      );
  }
  if (!response.ok)
    throw new ApiError(
      errorMessage(response.status, data?.error),
      response.status,
      data?.error || "",
    );
  if (response.status !== 204 && data === null)
    throw new ApiError("Máy chủ trả về dữ liệu không hợp lệ.", response.status);
  return data;
}
