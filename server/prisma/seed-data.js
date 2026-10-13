import snapshot from "./frontend-data.json" with { type: "json" };
export { snapshot };
export const roomData = snapshot.rooms.map(
  ({ view, guests, ...room }, sortOrder) => ({
    ...room,
    slug: room.id,
    viewType: view,
    maxGuests: guests,
    imageUrl: "assets/images/rooms/rooms-collage.png",
    sortOrder,
  }),
);
export const heroData = snapshot.heroSlides.map(
  ({ image, ...slide }, sortOrder) => ({
    ...slide,
    imageUrl: image,
    sortOrder,
  }),
);
export const newsData = snapshot.news.map(({ image, ...news }) => ({
  ...news,
  slug: news.id,
  imageUrl: image,
  content: news.excerpt,
  publishedAt: new Date(news.publishedAt + "T00:00:00Z"),
  isPublished: true,
}));
const subtitles = {
  grill: "Thơm ngon khó cưỡng",
  meal: "Hương vị thân quen",
  greens: "Tươi ngon từ cao nguyên",
};
export const contentData = [
  ...Object.entries(snapshot.foods).map(
    ([id, { name, ...food }], sortOrder) => ({
      id,
      section: "restaurant",
      title: name,
      ...food,
      subtitle: subtitles[id] || "Một bữa ăn ấm cúng sau ngày dài khám phá.",
      imageUrl: "assets/images/restaurant/food-collage.png",
      ctaText: "Khám phá món",
      ctaTarget: "#nha-hang",
      sortOrder,
    }),
  ),
  ...snapshot.cafeNames.map((title, q) => ({
    id: `cafe-${q}`,
    section: "cafe",
    title,
    description: snapshot.cafeDescriptions[q],
    imageUrl: "assets/images/cafe/cafe-collage.png",
    q,
    sortOrder: q,
    ctaTarget: "#ca-phe",
  })),
  {
    id: "weekday-offer",
    section: "promotion",
    title: "Kỳ nghỉ ngày thường",
    description:
      "Một chuyến đi thảnh thơi giữa tuần, kết hợp nghỉ ngơi và ăn uống.",
    subtitle:
      "Chương trình minh họa; điều kiện và quyền lợi chưa được áp dụng chính thức.",
    ctaText: "Tư vấn gói nghỉ & ăn",
    ctaTarget: "#lien-he",
    sortOrder: 0,
  },
  {
    id: "group-offer",
    section: "promotion",
    title: "Đi cùng nhau, vui nhiều hơn",
    description:
      "Gợi ý dành cho nhóm cần nhiều phòng. Chia sẻ ngày đi và số người để chuẩn bị phương án phù hợp.",
    subtitle:
      "Chương trình minh họa; điều kiện và quyền lợi chưa được áp dụng chính thức.",
    ctaText: "Tư vấn cho nhóm",
    ctaTarget: "#lien-he",
    sortOrder: 1,
  },
  {
    id: "about-90s",
    section: "experience",
    title: "Một điểm hẹn giữa Tam Đảo.",
    description:
      "Nghỉ giữa thiên nhiên, quây quần bên bữa ngon và dành thời gian cho nhau. 90s mang đến trải nghiệm lưu trú, nhà hàng và một không gian cà phê mới đang được chuẩn bị.",
    imageUrl: "assets/images/misc/logo.png",
    sortOrder: 0,
  },
];
export const configData = {
  hotline: snapshot.contact.hotline,
  zaloUrl: snapshot.contact.zalo,
  facebookUrl: snapshot.contact.facebook,
  address: snapshot.contact.location,
  mapUrl: snapshot.contact.map,
  siteTitle: "90s Homestay — Hẹn nhau ở Tam Đảo",
  siteDescription:
    "90s Homestay — lưu trú, nhà hàng và cà phê tại Tam Đảo. Bản mẫu giao diện.",
};
