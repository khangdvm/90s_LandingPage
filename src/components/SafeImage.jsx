import { useEffect, useState } from "react";
export default function SafeImage({
  src,
  alt = "",
  className = "",
  onError,
  ...props
}) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  if (!src || broken)
    return (
      <span
        className={`image-unavailable ${className}`}
        role="img"
        aria-label={alt || "Chưa có ảnh"}
      >
        Chưa có ảnh
      </span>
    );
  return (
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        setBroken(true);
        onError?.(e);
      }}
    />
  );
}
