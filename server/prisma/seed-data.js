import { editorialNews } from "./editorial-data.js";
import snapshot from "./frontend-data.json" with { type: "json" };
export { snapshot };
export const roomData = snapshot.rooms.map(
  ({ view, guests, ...room }, sortOrder) => ({
    ...room,
    slug: room.id,
    subtitle: `${room.beds} · Không gian nghỉ ngơi tại Tam Đảo`,
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
  ...editorialNews[news.id],
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
      menuItems: food.dishes.map((name, sortOrder) => ({
        name,
        price: null,
        unit: "",
        description: "",
        imageUrl: "",
        isActive: true,
        sortOrder,
      })),
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
    subtitle:
      [
        "Một góc thư giãn giữa núi",
        "Cùng bạn bè chuyện trò",
        "Dừng chân với ly đồ uống yêu thích",
      ][q] || "Tận hưởng nhịp sống chậm",
    description: [
      "Một không gian để ngồi lại giữa thiên nhiên, trò chuyện và tận hưởng một ngày không vội. Chọn góc ngồi yêu thích để đọc sách, ngắm cảnh hoặc cùng bạn bè chia sẻ câu chuyện.",
      "Cà phê, trà trái cây và những món uống cho một buổi hẹn thảnh thơi. Trao đổi với nhân viên về lựa chọn yêu thích và kết hợp khoảng nghỉ cùng lịch trình khám phá Tam Đảo.",
      "Một khoảng trời rộng để ngắm núi, thư giãn và lưu lại những khoảnh khắc cùng nhau. Dành thời gian tận hưởng cảnh quan, giữ không gian chung gọn gàng và lưu lại kỷ niệm của chuyến đi.",
    ][q],
    ctaText: "Khám phá không gian",
    imageUrl: "assets/images/cafe/cafe-collage.png",
    q,
    sortOrder: q,
    ctaTarget: "#ca-phe",
  })),
  {
    id: "weekday-offer",
    imageUrl: "assets/images/hero/hero-01.png",
    section: "promotion",
    title: "Kỳ nghỉ ngày thường",
    description:
      "Một chuyến đi thảnh thơi giữa tuần, kết hợp nghỉ ngơi và ăn uống.",
    subtitle: "Dành thêm thời gian nghỉ ngơi, ăn ngon và khám phá Tam Đảo.",
    ctaText: "Tư vấn gói nghỉ & ăn",
    ctaTarget: "#lien-he",
    sortOrder: 0,
  },
  {
    id: "group-offer",
    imageUrl: "assets/images/rooms/rooms-collage.png",
    section: "promotion",
    title: "Đi cùng nhau, vui nhiều hơn",
    description:
      "Gợi ý dành cho nhóm cần nhiều phòng. Chia sẻ ngày đi và số người để chuẩn bị phương án phù hợp.",
    subtitle: "Dành thêm thời gian nghỉ ngơi, ăn ngon và khám phá Tam Đảo.",
    ctaText: "Tư vấn cho nhóm",
    ctaTarget: "#lien-he",
    sortOrder: 1,
  },
  {
    id: "about-90s",
    subtitle: "VỀ 90s HOMESTAY",
    ctaText: "Xem hạng phòng",
    ctaTarget: "/phong/double",
    section: "experience",
    title: "Một điểm hẹn giữa Tam Đảo.",
    description:
      "Nghỉ giữa thiên nhiên, quây quần bên bữa ngon và dành thời gian cho nhau. 90s mang đến trải nghiệm lưu trú, nhà hàng và không gian cà phê để ngắm cảnh và trò chuyện.",
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
    "90s Homestay — lưu trú, nhà hàng và cà phê tại Tam Đảo. Khám phá phòng nghỉ, không gian và những gợi ý cho chuyến đi.",
};
