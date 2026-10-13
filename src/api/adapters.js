import { PublicApiError } from "./apiClient.js";
const invalid = () => {
  throw new PublicApiError("Không thể tải nội dung. Vui lòng thử lại sau.");
};
const item = (value, title) => {
  if (
    !value ||
    typeof value !== "object" ||
    typeof value.id !== "string" ||
    typeof value[title] !== "string"
  )
    invalid();
  return value;
};
const strings = (value, keys) => {
  if (!keys.every((key) => typeof value[key] === "string")) invalid();
};
export function mapApiRoom(value) {
  const room = item(value, "name");
  strings(room, ["description", "beds", "viewType", "imageUrl"]);
  if (
    typeof room.slug !== "string" ||
    !Number.isFinite(room.price) ||
    !Number.isInteger(room.maxGuests)
  )
    invalid();
  return {
    ...room,
    guests: room.maxGuests,
    view: room.viewType,
    image: room.imageUrl,
  };
}
export function mapApiHeroSlide(value) {
  const slide = item(value, "title");
  strings(slide, [
    "eyebrow",
    "description",
    "imageUrl",
    "badge",
    "ctaText",
    "ctaTarget",
  ]);
  return { ...slide, image: slide.imageUrl };
}
export function mapApiNewsItem(value) {
  const article = item(value, "title");
  strings(article, ["excerpt", "content", "imageUrl", "href"]);
  if (
    typeof article.slug !== "string" ||
    !["90s", "tam-dao"].includes(article.category) ||
    !Number.isFinite(Date.parse(article.publishedAt))
  )
    invalid();
  return { ...article, image: article.imageUrl };
}
export function mapApiContentCard(value) {
  const card = item(value, "title");
  strings(card, [
    "section",
    "subtitle",
    "description",
    "imageUrl",
    "ctaText",
    "ctaTarget",
  ]);
  if (
    !Array.isArray(card.dishes) ||
    !card.dishes.every((dish) => typeof dish === "string")
  )
    invalid();
  return {
    ...card,
    name: card.title,
    image: card.imageUrl,
    dishes: Array.isArray(card.dishes) ? card.dishes : [],
  };
}
export function mapCollection(value, mapper) {
  if (!Array.isArray(value)) invalid();
  return value.map(mapper);
}
export function mapNewsPage(value) {
  const page = value?.pagination;
  if (
    !page ||
    !["page", "limit", "total", "totalPages"].every((key) =>
      Number.isSafeInteger(page[key]),
    ) ||
    page.page < 1 ||
    page.limit < 1 ||
    page.total < 0 ||
    page.totalPages < 0
  )
    invalid();
  return { data: mapCollection(value.data, mapApiNewsItem), pagination: page };
}
export function mapSiteConfig(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.values(value).some((v) => typeof v !== "string")
  )
    invalid();
  return value;
}
