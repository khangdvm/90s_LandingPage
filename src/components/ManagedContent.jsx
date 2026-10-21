import { useSiteConfig } from "../data/SiteConfigContext.jsx";
import { settingDefaults } from "../../shared/content.js";
export function useContent() {
  const content = { ...settingDefaults, ...useSiteConfig().data };
  // Existing installations can still contain the former seed notice.
  if (
    /^Nội dung mẫu\s*\/?\s*chưa được (chủ website )?xác nhận\.?$/i.test(
      content.businessNotice?.trim(),
    )
  )
    content.businessNotice = "";
  if (content.cafeStatus === "Thông tin khu cà phê đang chờ xác nhận")
    content.cafeStatus = settingDefaults.cafeStatus;
  return content;
}
export function BusinessNotice() {
  const { businessNotice } = useContent();
  return businessNotice ? <p className="demo-note">{businessNotice}</p> : null;
}
export function SectionIntro({ id }) {
  const c = useContent();
  if (!c[id + "Title"] && !c[id + "Subtitle"] && !c[id + "Description"])
    return null;
  return (
    <div className="container section-head managed-intro">
      {c[id + "Subtitle"] && (
        <p className="eyebrow red">{c[id + "Subtitle"]}</p>
      )}
      {c[id + "Title"] && <h2>{c[id + "Title"]}</h2>}
      {c[id + "Description"] && (
        <p className="public-text">{c[id + "Description"]}</p>
      )}
    </div>
  );
}

export function SectionHeading({ id, title, subtitle, description, titleId }) {
  const c = useContent();
  return (
    <div>
      <p className="eyebrow red">{c[id + "Subtitle"] || subtitle}</p>
      <h2 id={titleId}>{c[id + "Title"] || title}</h2>
      {(c[id + "Description"] || description) && (
        <p className="section-description public-text">
          {c[id + "Description"] || description}
        </p>
      )}
    </div>
  );
}
