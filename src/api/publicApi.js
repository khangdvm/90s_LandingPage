import { publicRequest } from "./apiClient.js";
import {
  mapCollection,
  mapApiRoom,
  mapApiHeroSlide,
  mapApiNewsItem,
  mapApiContentCard,
  mapNewsPage,
  mapSiteConfig,
} from "./adapters.js";
const collection = async (path, mapper, signal) =>
  mapCollection(await publicRequest(path, signal), mapper);
export const publicApi = {
  rooms: (signal) => collection("/rooms", mapApiRoom, signal),
  room: async (slug, signal) =>
    mapApiRoom(
      await publicRequest(`/rooms/${encodeURIComponent(slug)}`, signal),
    ),
  heroSlides: (signal) => collection("/hero-slides", mapApiHeroSlide, signal),
  news: async ({ category, page, limit }, signal) =>
    mapNewsPage(
      await publicRequest(
        `/news?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page), limit: String(limit) })}`,
        signal,
      ),
    ),
  newsItem: async (slug, signal) =>
    mapApiNewsItem(
      await publicRequest(`/news/${encodeURIComponent(slug)}`, signal),
    ),
  contentItem: async (id, signal) => mapApiContentCard(await publicRequest(`/content/item/${encodeURIComponent(id)}`, signal)),
  restaurant: (signal) =>
    collection("/content/restaurant", mapApiContentCard, signal),
  cafe: (signal) => collection("/content/cafe", mapApiContentCard, signal),
  promotion: (signal) =>
    collection("/content/promotion", mapApiContentCard, signal),
  experience: (signal) =>
    collection("/content/experience", mapApiContentCard, signal),
  siteConfig: async (signal) =>
    mapSiteConfig(await publicRequest("/site-config", signal)),
};
