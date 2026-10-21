export const sectionIds = [
  "ve-90s",
  "phong-nghi",
  "nha-hang",
  "ca-phe",
  "uu-dai",
  "tin-tuc",
  "lien-he",
];
export function external(value) {
  if (
    typeof value !== "string" ||
    value.length > 20000 ||
    !/^https?:\/\/[^/]/i.test(value)
  )
    return false;
  try {
    const u = new URL(value);
    return (
      /^https?:$/.test(u.protocol) &&
      !u.username &&
      !u.password &&
      !/[\\\s]/.test(value)
    );
  } catch {
    return false;
  }
}
const empty = (v) =>
  v === "" || (typeof v === "string" && /^PLACEHOLDER_[A-Z0-9_]+$/.test(v));
export const image = (v) =>
  typeof v === "string" &&
  v.length <= 20000 &&
  (empty(v) ||
    external(v) ||
    (/^\/?assets\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|gif|avif|svg)$/.test(v) &&
      !v.includes("..")) ||
    /^\/uploads\/[a-f0-9-]+\.webp$/.test(v));
export const contact = (v) =>
  typeof v === "string" && v.length <= 20000 && (empty(v) || external(v));
export const target = (v) =>
  typeof v === "string" &&
  v.length <= 20000 &&
  (empty(v) ||
    v === "#" ||
    external(v) ||
    sectionIds.some((id) => v === "#" + id) ||
    /^\/(phong|tin-tuc)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v));
export const phone = (v) =>
  typeof v === "string" &&
  v.length <= 20000 &&
  (empty(v) ||
    (/^\+?[\d ()-]{3,30}$/.test(v) &&
      v.replace(/\D/g, "").length >= 3 &&
      v.replace(/\D/g, "").length <= 15));
export const settingDefaults = {
  brandName: "90s Homestay",
  logoUrl: "assets/images/misc/logo.png",
  footerText: "Hẹn nhau ở Tam Đảo",
  businessNotice: "Nội dung mẫu chưa được chủ website xác nhận.",
  contentConfirmed: "false",
  cafeStatus: "Thông tin khu cà phê đang chờ xác nhận",
  unpricedLabel: "Liên hệ để biết giá",
};
for (const id of sectionIds) {
  settingDefaults[id + "Enabled"] = "true";
  settingDefaults[id + "Title"] = "";
  settingDefaults[id + "Subtitle"] = "";
  settingDefaults[id + "Description"] = "";
}
export function validMenu(items) {
  return (
    Array.isArray(items) &&
    items.length <= 100 &&
    items.every(
      (x) =>
        x &&
        Object.keys(x).every((k) =>
          [
            "name",
            "price",
            "unit",
            "description",
            "imageUrl",
            "isActive",
            "sortOrder",
          ].includes(k),
        ) &&
        typeof x.name === "string" &&
        x.name.trim() &&
        x.name.length <= 500 &&
        (x.price === null ||
          (Number.isSafeInteger(x.price) &&
            x.price >= 0 &&
            x.price <= 2147483647)) &&
        ["unit", "description"].every(
          (k) => typeof x[k] === "string" && x[k].length <= 2000,
        ) &&
        image(x.imageUrl) &&
        typeof x.isActive === "boolean" &&
        Number.isSafeInteger(x.sortOrder) &&
        x.sortOrder >= 0,
    )
  );
}
export function validDoc(doc) {
  return (
    Array.isArray(doc) &&
    doc.length <= 300 &&
    doc.every(
      (b) =>
        b &&
        ["paragraph", "heading", "list", "image"].includes(b.type) &&
        Object.keys(b).every((k) =>
          ["type", "text", "bold", "italic", "href", "src"].includes(k),
        ) &&
        typeof b.text === "string" &&
        b.text.length <= 20000 &&
        (b.bold === undefined || typeof b.bold === "boolean") &&
        (b.italic === undefined || typeof b.italic === "boolean") &&
        (b.href === undefined || contact(b.href)) &&
        (b.src === undefined || image(b.src)),
    )
  );
}

export const galleryImage = (v) =>
  Boolean(v) && image(v) && !v.startsWith("PLACEHOLDER_");
export function menuFromNames(names, existing = []) {
  const remaining = Array.isArray(existing) ? [...existing] : [];
  return names.map((name, sortOrder) => {
    const index = remaining.findIndex((x) => x.name === name);
    const previous =
      index < 0
        ? {
            price: null,
            unit: "",
            description: "",
            imageUrl: "",
            isActive: true,
          }
        : remaining.splice(index, 1)[0];
    return { ...previous, name, sortOrder };
  });
}
