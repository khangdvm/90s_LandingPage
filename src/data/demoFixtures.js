// Original demo fixtures for seed fidelity tests only. Never imported by the public website.
export const DEMO_CONTACT_INFO = {
  hotline: "PLACEHOLDER_HOTLINE",
  zalo: "PLACEHOLDER_ZALO_URL",
  facebook: "PLACEHOLDER_FACEBOOK_URL",
  location: "Tam Đảo",
  map: "https://www.google.com/maps/search/?api=1&query=90s+Homestay+Tam+Dao",
};

export const DEMO_ROOMS = [
  {
    id: "double",
    name: "Phòng đôi view núi",
    count: 6,
    view: "valley",
    price: 850000,
    guests: 2,
    beds: "1 giường đôi",
    q: 0,
    description:
      "Một khung cửa lớn mở ra thung lũng. Gợi ý cho hai người muốn dành một kỳ nghỉ thong thả giữa núi.",
  },
  {
    id: "bungalow",
    name: "Bungalow riêng tư",
    count: 8,
    view: "valley",
    price: 650000,
    guests: 2,
    beds: "1 giường đôi",
    q: 1,
    description:
      "Một căn nhà nhỏ gần thiên nhiên, với khoảng không gian riêng để nghỉ ngơi và tận hưởng chuyến đi cùng nhau.",
  },
  {
    id: "family",
    name: "Phòng gia đình",
    count: 4,
    view: "town",
    price: 1250000,
    guests: 4,
    beds: "2 giường đôi",
    q: 2,
    description:
      "Không gian cho gia đình, cùng nhau nghỉ ngơi và nhìn ngắm nhịp sống của thị trấn từ trên cao.",
  },
  {
    id: "group",
    name: "Phòng nhóm bạn",
    count: 2,
    view: "town",
    price: 1650000,
    guests: 6,
    beds: "3 giường đôi",
    q: 3,
    description:
      "Một lựa chọn cho nhóm bạn muốn ở gần nhau, chia sẻ những câu chuyện và những khoảnh khắc trong kỳ nghỉ.",
  },
];

export const DEMO_FOODS = {
  hotpot: {
    name: "Lẩu nóng",
    q: 0,
    description:
      "Một nồi lẩu nóng hổi giữa tiết trời Tam Đảo, cùng rau xanh và những món ăn kèm để cả bàn cùng thưởng thức.",
    dishes: ["Lẩu gà", "Lẩu bò", "Lẩu thập cẩm"],
  },
  grill: {
    name: "Món nướng",
    q: 1,
    description:
      "Thịt nướng thơm, rau củ và những món ăn kèm cho một bữa tối vui bên người thân.",
    dishes: ["Thịt ba chỉ nướng", "Bò nướng", "Rau củ nướng"],
  },
  meal: {
    name: "Cơm nhà",
    q: 2,
    description: "Bữa cơm ấm cúng, vừa vặn để quây quần sau một ngày khám phá.",
    dishes: ["Mâm cơm gia đình", "Món kho ăn cùng cơm", "Canh theo ngày"],
  },
  greens: {
    name: "Món rau theo mùa",
    q: 3,
    description:
      "Thêm một đĩa rau xanh cho bữa ăn, với cách chế biến gần gũi, dễ thưởng thức.",
    dishes: ["Ngọn su su xào tỏi", "Rau luộc", "Rau xào theo mùa"],
  },
};

export const DEMO_CAFE_NAMES = [
  "Không gian thư giãn",
  "Đồ uống yêu thích",
  "Góc ngắm cảnh",
];

export const DEMO_CAFE_DESCRIPTIONS = [
  "Ý tưởng về một không gian để ngồi lại giữa thiên nhiên, trò chuyện và tận hưởng một ngày không vội.",
  "Cà phê, trà trái cây và những món uống cho một buổi hẹn thảnh thơi. Thực đơn chính thức sẽ được cập nhật khi khai trương.",
  "Một khoảng trời rộng để ngắm núi, thư giãn và lưu lại những khoảnh khắc cùng nhau.",
];

// Historical hero seed fixtures. Live campaigns are edited in /admin/hero.
export const DEMO_HERO_SLIDES = [
  {
    id: "hero-01",
    image: "assets/images/hero/hero-01.png",
    eyebrow: "90S HOMESTAY · TAM ĐẢO",
    title: "Lên núi thôi.\nHẹn nhau ở 90s.",
    description: "Một kỳ nghỉ giữa thiên nhiên, bên những người bạn thương.",
    ctaText: "Khám phá phòng nghỉ",
    ctaTarget: "#phong-nghi",
    badge: "",
  },
  {
    id: "promotion-demo",
    image: "assets/images/hero/hero-01.png",
    eyebrow: "GỢI Ý CHO KỲ NGHỈ",
    title: "Thêm trải nghiệm\ncho kỳ nghỉ.",
    description:
      "Chiến dịch mẫu để duyệt giao diện. Nội dung và điều kiện sẽ được cập nhật.",
    ctaText: "Nhận tư vấn",
    ctaTarget: "#lien-he",
    badge: "Ưu đãi · Demo",
  },
  {
    id: "experience",
    image: "assets/images/hero/hero-01.png",
    eyebrow: "NHÀ HÀNG · CÀ PHÊ",
    title: "Một điểm hẹn,\nnhiều trải nghiệm.",
    description: "Quây quần bên bữa ngon và dành thời gian cho nhau.",
    ctaText: "Khám phá nhà hàng",
    ctaTarget: "#nha-hang",
    badge: "",
  },
];

// TODO: Replace with official 90s Homestay content, images and publication dates.
// These are clearly labelled layout samples, not factual announcements.
export const DEMO_NEWS_DATA = ["90s", "tam-dao"].flatMap((category) =>
  [
    "Một điểm hẹn giữa núi",
    "Gợi ý cho một ngày thong thả",
    "Những góc nhìn trong chuyến đi",
    "Một bữa ăn cùng nhau",
    "Khoảnh khắc giữa thiên nhiên",
    "Chuyện của một kỳ nghỉ",
    "Một hành trình mới",
    "Hẹn nhau trong chuyến đi tiếp theo",
  ].map((title, index) => ({
    id: `${category}-${index + 1}`,
    category,
    title: `[Bài mẫu] ${title}`,
    excerpt: `Nội dung minh họa cho chuyên mục ${category === "90s" ? "Về 90s" : "Về Tam Đảo"}. Bài viết chính thức sẽ được bổ sung sau khi duyệt.`,
    image: "assets/images/news/news-placeholder-01.png",
    publishedAt: `2026-10-${String(index + 1).padStart(2, "0")}`,
    href: "#",
  })),
);
