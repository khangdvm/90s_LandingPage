import {
  image,
  galleryImage,
  menuFromNames,
  contact,
  target,
  phone,
  validMenu,
  validDoc,
  settingDefaults,
} from "../../../shared/content.js";
import { HttpError } from "./errors.js";
export const sections = ["restaurant", "cafe", "promotion", "experience"];
export const configKeys = [
  ...Object.keys(settingDefaults),
  "hotline",
  "zaloUrl",
  "facebookUrl",
  "address",
  "mapUrl",
  "siteTitle",
  "siteDescription",
];
const fail = (message) => {
  throw new HttpError(400, message);
};
const text = (v) => typeof v === "string" && v.length <= 20000;
const requiredText = (v) => text(v) && v.trim().length > 0;
const integer =
  (min, max = 2147483647) =>
  (v) =>
    Number.isSafeInteger(v) && v >= min && v <= max;
const choice = (values) => (v) => values.includes(v);
const slug = (v) =>
  typeof v === "string" &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) &&
  v.length <= 160;
export const link = target;
const common = {
  sortOrder: integer(0),
  isActive: (v) => typeof v === "boolean",
  imageUrl: image,
};
const schemas = {
  rooms: {
    gallery: (v) => Array.isArray(v) && v.length <= 30 && v.every(galleryImage),
    name: requiredText,
    slug,
    description: text,
    price: integer(0),
    maxGuests: integer(1),
    beds: text,
    viewType: choice(["valley", "town"]),
    count: integer(0),
    q: integer(0, 3),
    ...common,
  },
  "hero-slides": {
    eyebrow: text,
    title: requiredText,
    description: text,
    badge: text,
    ctaText: text,
    ctaTarget: target,
    ...common,
  },
  news: {
    slug,
    category: choice(["90s", "tam-dao"]),
    title: requiredText,
    excerpt: text,
    content: text,
    contentDoc: validDoc,
    imageUrl: image,
    href: target,
    publishedAt: (v) =>
      typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(v) &&
      Number.isFinite(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v.slice(0, 10),
    isPublished: (v) => typeof v === "boolean",
  },
  content: {
    section: choice(sections),
    title: requiredText,
    subtitle: text,
    description: text,
    ctaText: text,
    ctaTarget: target,
    q: integer(0, 3),
    menuItems: validMenu,
    dishes: (v) => Array.isArray(v) && v.length <= 100 && v.every(requiredText),
    ...common,
  },
};
const required = {
  rooms: ["name", "slug", "price", "maxGuests"],
  "hero-slides": ["title"],
  news: ["slug", "category", "title"],
  content: ["section", "title"],
};
export function object(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    !Object.keys(body).length
  )
    fail("A nonempty JSON object is required");
}
export function payload(resource, body, patch = false) {
  object(body);
  const schema = schemas[resource];
  for (const [key, value] of Object.entries(body))
    if (!Object.hasOwn(schema, key) || !schema[key](value))
      fail(`Invalid field: ${key}`);
  if (!patch)
    for (const key of required[resource])
      if (!Object.hasOwn(body, key)) fail(`Required field: ${key}`);
  const data = { ...body };
  if (
    resource === "content" &&
    Object.hasOwn(body, "dishes") &&
    !Object.hasOwn(body, "menuItems")
  )
    data.menuItems = menuFromNames(body.dishes);
  if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
  return data;
}
export function pagination(query) {
  const parse = (v, fallback, max) => {
    if (v === undefined) return fallback;
    if (
      typeof v !== "string" ||
      !/^[1-9]\d*$/.test(v) ||
      !Number.isSafeInteger(Number(v)) ||
      Number(v) > max
    )
      fail("Invalid pagination");
    return Number(v);
  };
  const page = parse(query.page, 1, 1000000),
    limit = parse(query.limit, 6, 50);
  if (
    query.category !== undefined &&
    !["90s", "tam-dao"].includes(query.category)
  )
    fail("Invalid news category");
  return { page, limit };
}
export function siteConfig(body) {
  object(body);
  for (const [key, value] of Object.entries(body)) {
    if (!configKeys.includes(key) || !text(value))
      fail(`Invalid config: ${key}`);
    if (["zaloUrl", "facebookUrl", "mapUrl"].includes(key) && !contact(value))
      fail(`Invalid URL: ${key}`);
    if (key === "hotline" && !phone(value)) fail("Số điện thoại không hợp lệ");
    if (key === "logoUrl" && !image(value))
      fail("Đường dẫn ảnh logo không hợp lệ");
    if (
      (key.endsWith("Enabled") || key === "contentConfirmed") &&
      !["true", "false"].includes(value)
    )
      fail("Chọn true hoặc false");
  }
  return body;
}
export function login(body) {
  object(body);
  if (
    Object.keys(body).some((k) => !["email", "password"].includes(k)) ||
    typeof body.email !== "string" ||
    body.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
    typeof body.password !== "string" ||
    !body.password ||
    Buffer.byteLength(body.password) > 72
  )
    fail("Invalid login payload");
  return { email: body.email.trim().toLowerCase(), password: body.password };
}
