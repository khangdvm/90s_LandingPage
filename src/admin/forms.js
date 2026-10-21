import {
  image as validImage,
  contact,
  target,
  phone,
  validMenu,
  validDoc,
  settingDefaults,
  sectionIds,
} from "../../shared/content.js";
export const categories = [
  ["90s", "Về 90s"],
  ["tam-dao", "Về Tam Đảo"],
];
export const sections = [
  ["restaurant", "Nhà hàng"],
  ["cafe", "Cà phê"],
  ["promotion", "Ưu đãi"],
  ["experience", "Trải nghiệm"],
];
const text = (key, label, extra = {}) => ({
  key,
  label,
  type: "text",
  ...extra,
});
const number = (key, label, min = 0, extra = {}) => ({
  key,
  label,
  type: "number",
  min,
  max: 2147483647,
  ...extra,
});
const select = (key, label, options) => ({
  key,
  label,
  type: "select",
  options,
});
const title = text("title", "Tiêu đề", { required: true });
const description = text("description", "Mô tả", { type: "textarea" });
const image = text("imageUrl", "URL hoặc đường dẫn ảnh", {
  url: true,
  hint: "Ví dụ: assets/images/hero/hero-01.png hoặc URL https://…",
});
const sort = number("sortOrder", "Thứ tự hiển thị", 0, {
  hint: "Số nhỏ hiển thị trước.",
});
const active = { key: "isActive", label: "Bật hiển thị", type: "checkbox" };
const cta = [
  text("ctaText", "Nhãn nút liên hệ"),
  text("ctaTarget", "Liên kết nút", {
    url: true,
    hint: "Ví dụ: #lien-he, #phong-nghi hoặc URL https://…",
  }),
];
const quadrant = number("q", "Ô ảnh collage (0–3)", 0, {
  max: 3,
  hint: "0: trên trái · 1: trên phải · 2: dưới trái · 3: dưới phải. Đây là trường hiển thị của ảnh collage hiện tại.",
});
const slug = text("slug", "Đường dẫn (slug)", {
  required: true,
  slug: true,
  maxLength: 160,
  hint: "Chữ thường không dấu, số và dấu gạch nối. Ví dụ: phong-doi-view-nui.",
});
export const resources = {
  rooms: {
    api: "rooms",
    title: "Phòng nghỉ",
    singular: "phòng",
    create: "Thêm phòng",
    description: "Chỉnh sửa thông tin phòng để khách tham khảo và nhận tư vấn.",
    defaults: {
      price: 0,
      maxGuests: 2,
      viewType: "valley",
      count: 0,
      q: 0,
      sortOrder: 0,
      isActive: true,
    },
    fields: [
      text("name", "Tên phòng", { required: true }),
      slug,
      description,
      number("price", "Giá tham khảo (VND)"),
      number("maxGuests", "Sức chứa tối đa", 1),
      text("beds", "Thông tin giường"),
      select("viewType", "Hướng nhìn", [
        ["valley", "View thung lũng"],
        ["town", "View thị trấn"],
      ]),
      { key: "gallery", label: "Gallery phòng", type: "gallery" },
      number("count", "Tổng số phòng hiển thị", 0, {
        hint: "Thông tin mô tả của hạng phòng; không dùng để kiểm tra phòng trống.",
      }),
      image,

      sort,
      active,
    ],
  },
  hero: {
    api: "hero-slides",
    title: "Hero / Slider",
    singular: "slide",
    create: "Thêm slide",
    description:
      "Quản lý ảnh bìa, chiến dịch và slide ưu đãi; thay đổi thứ tự bằng số hiển thị.",
    defaults: { sortOrder: 0, isActive: true },
    fields: [
      text("eyebrow", "Dòng giới thiệu"),
      { ...title, type: "textarea" },
      description,
      image,
      text("badge", "Nhãn ưu đãi", {
        hint: "Ví dụ: Ưu đãi. Để trống nếu không cần nhãn.",
      }),
      ...cta,
      sort,
      active,
    ],
  },
  news: {
    api: "news",
    title: "Tin tức",
    singular: "bài viết",
    create: "Viết bài mới",
    description: "Quản lý bài viết trong hai chuyên mục Về 90s và Về Tam Đảo.",
    filter: { key: "category", label: "Chuyên mục", options: categories },
    defaults: { category: "90s", isPublished: false, href: "#" },
    fields: [
      title,
      slug,
      select("category", "Chuyên mục", categories),
      text("excerpt", "Tóm tắt", { type: "textarea" }),
      text("content", "Nội dung bài viết", {
        type: "textarea",
        large: true,
        hint: "Nội dung văn bản thuần; không nhập HTML.",
      }),
      { key: "contentDoc", label: "Soạn bài có định dạng", type: "document" },
      image,
      text("href", "Liên kết bài viết", {
        url: true,
        hint: "Giữ # nếu bài viết không có đường dẫn bên ngoài.",
      }),
      {
        key: "publishedAt",
        label: "Ngày hiển thị trên bài",
        type: "datetime-local",
        required: true,
        hint: "Giờ địa phương của thiết bị. Trạng thái “Đăng bài” quyết định bài có được công khai hay không.",
      },
      { key: "isPublished", label: "Đăng bài", type: "checkbox" },
    ],
  },
  content: {
    api: "content",
    title: "Nội dung",
    singular: "thẻ nội dung",
    create: "Thêm nội dung",
    description: "Chỉnh sửa nội dung trong các nhóm có sẵn của website.",
    filter: { key: "section", label: "Nhóm nội dung", options: sections },
    defaults: {
      section: "restaurant",
      q: 0,
      dishes: [],
      sortOrder: 0,
      isActive: true,
    },
    fields: [
      select("section", "Nhóm nội dung", sections),
      title,
      text("subtitle", "Tiêu đề phụ"),
      description,
      image,
      ...cta,

      { key: "menuItems", label: "Thực đơn", type: "menu" },
      sort,
      active,
    ],
  },
};
export const settingFields = [
  text("hotline", "Hotline", {
    hint: "Số điện thoại chính thức hoặc placeholder hiện tại.",
  }),
  text("zaloUrl", "Liên kết Zalo", { url: true }),
  text("facebookUrl", "Liên kết Facebook", { url: true }),
  text("address", "Địa chỉ"),
  text("mapUrl", "Liên kết bản đồ", { url: true }),
  text("siteTitle", "Tiêu đề website"),
  text("siteDescription", "Mô tả website", { type: "textarea" }),
];
settingFields.push(
  text("brandName", "Tên thương hiệu"),
  text("logoUrl", "URL logo", { url: true }),
  text("footerText", "Nội dung footer", { type: "textarea" }),
  text("businessNotice", "Thông báo kinh doanh", { type: "textarea" }),
  select("contentConfirmed", "Trạng thái xác nhận toàn bộ nội dung", [
    ["false", "Dữ liệu mẫu / chưa xác nhận"],
    ["true", "Chủ website đã xác nhận toàn bộ"],
  ]),
  text("cafeStatus", "Trạng thái khu cà phê"),
  text("unpricedLabel", "Nhãn món chưa có giá"),
);
for (const id of sectionIds) {
  const label = {
    "ve-90s": "Về 90s",
    "phong-nghi": "Phòng nghỉ",
    "nha-hang": "Nhà hàng",
    "ca-phe": "Cà phê",
    "uu-dai": "Ưu đãi",
    "tin-tuc": "Tin tức",
    "lien-he": "Liên hệ",
  }[id];
  settingFields.push(
    select(id + "Enabled", label + " — hiển thị", [
      ["true", "Bật"],
      ["false", "Tắt"],
    ]),
    text(id + "Title", label + " — tiêu đề"),
    text(id + "Subtitle", label + " — tiêu đề phụ"),
    text(id + "Description", label + " — mô tả", { type: "textarea" }),
  );
}
function localDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";
}
export function draftFor(config, row) {
  const values = { ...config.defaults, ...row };
  if (!values.menuItems?.length && values.dishes?.length)
    values.menuItems = values.dishes.map((name, sortOrder) => ({
      name,
      price: null,
      unit: "",
      description: "",
      imageUrl: "",
      isActive: true,
      sortOrder,
    }));
  return Object.fromEntries(
    config.fields.map((field) => {
      const value = values[field.key];
      return [
        field.key,
        ["gallery", "menu", "document"].includes(field.type)
          ? Array.isArray(value)
            ? value
            : []
          : field.type === "checkbox"
            ? Boolean(value)
            : field.type === "lines"
              ? (value || []).join("\n")
              : field.type === "datetime-local"
                ? localDate(value || new Date())
                : String(value ?? ""),
      ];
    }),
  );
}
export function validateDraft(fields, draft) {
  const errors = {};
  for (const field of fields) {
    const value = draft[field.key];
    if (field.required && !String(value ?? "").trim())
      errors[field.key] = `Vui lòng nhập ${field.label.toLowerCase()}.`;
    else if (
      field.type === "number" &&
      (value === "" ||
        !Number.isSafeInteger(Number(value)) ||
        Number(value) < field.min ||
        Number(value) > field.max)
    )
      errors[field.key] =
        `${field.label} phải là số nguyên từ ${field.min} đến ${field.max}.`;
    else if (
      field.slug &&
      (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || value.length > 160)
    )
      errors[field.key] =
        "Đường dẫn chỉ dùng chữ thường không dấu, số và dấu gạch nối (tối đa 160 ký tự).";
    else if (field.options && !field.options.some(([key]) => key === value))
      errors[field.key] = "Vui lòng chọn một giá trị hợp lệ.";
    else if (
      field.url &&
      !(field.key === "imageUrl" || field.key === "logoUrl"
        ? validImage(value)
        : ["zaloUrl", "facebookUrl", "mapUrl"].includes(field.key)
          ? contact(value)
          : target(value))
    )
      errors[field.key] =
        "Liên kết sai mục đích: ảnh dùng assets/, /uploads/ hoặc HTTP/HTTPS; liên hệ dùng HTTP/HTTPS; CTA dùng section hoặc trang chi tiết.";
    else if (field.key === "hotline" && !phone(value))
      errors[field.key] = "Số điện thoại không hợp lệ.";
    else if (
      field.type === "datetime-local" &&
      !Number.isFinite(new Date(value).getTime())
    )
      errors[field.key] = "Ngày và giờ không hợp lệ.";
    else if (
      field.type === "lines" &&
      String(value)
        .split("\n")
        .filter((x) => x.trim()).length > 100
    )
      errors[field.key] = "Chỉ nhập tối đa 100 món.";
    else if (
      field.type === "gallery" &&
      (value.length > 30 || !value.every((v) => v && validImage(v)))
    )
      errors[field.key] = "Gallery cần ảnh hợp lệ, tối đa 30 ảnh.";
    else if (field.type === "menu" && !validMenu(value))
      errors[field.key] = "Kiểm tra tên, giá và ảnh từng món.";
    else if (field.type === "document" && !validDoc(value))
      errors[field.key] = "Kiểm tra nội dung, ảnh và liên kết bài viết.";
    else if (typeof value === "string" && value.length > 20000)
      errors[field.key] = "Nội dung không được vượt quá 20.000 ký tự.";
  }
  return errors;
}
export function payloadFor(config, draft, original) {
  const initial = original ? draftFor(config, original) : null;
  return Object.fromEntries(
    config.fields
      .filter(
        (field) =>
          !initial ||
          JSON.stringify(draft[field.key]) !==
            JSON.stringify(initial[field.key]),
      )
      .map((field) => {
        const value = draft[field.key];
        return [
          field.key,
          field.type === "number"
            ? Number(value)
            : field.type === "datetime-local"
              ? new Date(value).toISOString()
              : field.type === "lines"
                ? value
                    .split("\n")
                    .map((x) => x.trim())
                    .filter(Boolean)
                : value,
        ];
      }),
  );
}
export function slugFrom(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160)
    .replace(/-$/, "");
}
