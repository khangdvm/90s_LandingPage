import { HttpError } from "./errors.js";
export const sections = ["restaurant", "cafe", "promotion", "experience"];
export const configKeys = [
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
export const link = (v) =>
  text(v) &&
  (v === "" ||
    v.startsWith("PLACEHOLDER_") ||
    /^#[a-zA-Z0-9_-]*$/.test(v) ||
    (/^\/?assets\/[a-zA-Z0-9_./-]+$/.test(v) && !v.includes("..")) ||
    (() => {
      try {
        const u = new URL(v);
        return (
          ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
        );
      } catch {
        return false;
      }
    })());
const common = {
  sortOrder: integer(0),
  isActive: (v) => typeof v === "boolean",
  imageUrl: link,
};
const schemas = {
  rooms: {
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
    ctaTarget: link,
    ...common,
  },
  news: {
    slug,
    category: choice(["90s", "tam-dao"]),
    title: requiredText,
    excerpt: text,
    content: text,
    imageUrl: link,
    href: link,
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
    ctaTarget: link,
    q: integer(0, 3),
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
    if (["zaloUrl", "facebookUrl", "mapUrl"].includes(key) && !link(value))
      fail(`Invalid URL: ${key}`);
    if (
      key === "hotline" &&
      value &&
      !value.startsWith("PLACEHOLDER_") &&
      !/^\+?[\d ()-]{3,30}$/.test(value)
    )
      fail("Invalid hotline");
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
