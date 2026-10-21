import { useCallback } from "react";
import { publicApi } from "../api/publicApi.js";
import { usePublicResource } from "../hooks/usePublicResource.js";
import { RoomDetails } from "./Rooms.jsx";
import PublicState from "./PublicState.jsx";
import { displayDateTime } from "../data/data.js";
import MediaGallery, { UpdatedAt } from "./MediaGallery.jsx";
import RichDocument from "./RichDocument.jsx";
export function RoomDetail({ room, onConsult, onAllRooms }) {
  const loader = useCallback(
    (signal) => publicApi.room(room.slug, signal),
    [room.slug],
  );
  const resource = usePublicResource(loader);
  if (!resource.data)
    return <PublicState resource={resource} label="thông tin phòng" />;
  return (
    <RoomDetails
      room={resource.data}
      onConsult={onConsult}
      onAllRooms={onAllRooms}
    />
  );
}
export function ArticleDetail({ slug }) {
  const loader = useCallback(
    (signal) => publicApi.newsItem(slug, signal),
    [slug],
  );
  const resource = usePublicResource(loader);
  if (!resource.data)
    return <PublicState resource={resource} label="bài viết" />;
  const article = resource.data;
  return (
    <>
      <MediaGallery item={article} />
      {article.subtitle && <p>{article.subtitle}</p>}
      <UpdatedAt value={article.updatedAt} />
      <p>
        <time dateTime={article.publishedAt}>
          {displayDateTime(article.publishedAt)}
        </time>
      </p>
      <RichDocument
        blocks={article.contentDoc}
        legacy={article.content || article.excerpt}
      />
    </>
  );
}
