import { useCallback } from "react";
import { publicApi } from "../api/publicApi.js";
import { usePublicResource } from "../hooks/usePublicResource.js";
import { RoomDetails } from "./Rooms.jsx";
import PublicState from "./PublicState.jsx";
import { assetUrl, displayDate } from "../data/data.js";
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
      {assetUrl(article.image) && (
        <img
          className="modal-room-photo article-photo"
          src={assetUrl(article.image)}
          alt={article.title}
        />
      )}
      <p>
        <time dateTime={article.publishedAt}>
          {displayDate(article.publishedAt)}
        </time>
      </p>
      <p className="public-text">{article.content || article.excerpt}</p>
    </>
  );
}
