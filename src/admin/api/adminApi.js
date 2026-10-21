import { apiRequest } from "./apiClient.js";
export const adminApi = {
  login: (body) =>
    apiRequest("/login", { method: "POST", body, authenticated: false }),
  list: (resource, signal, query) =>
    apiRequest(`/${resource}${query ? "?" + new URLSearchParams(query) : ""}`, {
      signal,
    }),
  upload: (file, signal) => {
    const body = new FormData();
    body.append("image", file);
    return apiRequest("/uploads", { method: "POST", body, signal });
  },
  get: (resource, id, signal) =>
    apiRequest(`/${resource}/${encodeURIComponent(id)}`, { signal }),
  create: (resource, body) =>
    apiRequest(`/${resource}`, { method: "POST", body }),
  update: (resource, id, body) =>
    apiRequest(`/${resource}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),
  remove: (resource, id) =>
    apiRequest(`/${resource}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  settings: (signal) => apiRequest("/site-config", { signal }),
  saveSettings: (body) => apiRequest("/site-config", { method: "PATCH", body }),
};
