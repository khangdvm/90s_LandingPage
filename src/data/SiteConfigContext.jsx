import { createContext, useContext } from "react";
export const SiteConfigContext = createContext({
  data: null,
  loading: true,
  error: null,
  retry: () => {},
});
export const useSiteConfig = () => useContext(SiteConfigContext);
