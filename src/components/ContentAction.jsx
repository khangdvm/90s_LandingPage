import { contentTarget, externalUrl } from "../data/data.js";
export default function ContentAction({
  card,
  onDetail,
  onConsult,
  defaultTarget,
  children,
  ...props
}) {
  const target = contentTarget(card.ctaTarget);
  if (target && target !== defaultTarget && target !== "#lien-he")
    return (
      <a
        {...props}
        href={target}
        {...(externalUrl(target)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  return (
    <button
      {...props}
      onClick={() => (target === "#lien-he" ? onConsult?.() : onDetail?.())}
    >
      {children}
    </button>
  );
}
