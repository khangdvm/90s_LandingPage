# 90s Homestay — React + Vite

React public-site prototype with a separate CMS admin interface, converted from the supplied 90sLanding demo. Uses JavaScript functional components, hooks and plain CSS; preserves the original layout, red branding, typography and all frontend interactions.

## Requirements and local run

Use Node.js 22.12+ (or a newer supported LTS version) and npm.

```sh
cd 90s_LandingPage
npm install
npm run dev
```

For a production build:

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to static hosting. Set `VITE_BASE_PATH=/subdirectory/` in the frontend environment when deploying within a subdirectory. The default is `/`; the absolute base supports direct admin routes. Use Vite or static hosting; opening the React source `index.html` through `file://` is not supported.

## CMS admin (quản trị nội dung)

Các trang: `/admin/login`, `/admin`, `/admin/rooms`, `/admin/hero`, `/admin/news`, `/admin/content`, `/admin/settings`.

Admin hỗ trợ thêm/sửa/xóa phòng, slide, tin tức, content cards; bật/tắt, thứ tự hiển thị, đăng/gỡ đăng bài, lọc chuyên mục/nhóm nội dung và cập nhật Hotline/Zalo/Facebook cùng các cài đặt website. Ảnh dùng URL/đường dẫn và có xem trước; chưa có upload. Content là văn bản thuần; không có chỉnh sửa HTML, CSS hay bố cục.

**Dữ liệu lưu từ admin chưa thay đổi website công khai trong giai đoạn này.** Website công khai vẫn dùng dữ liệu cũ; kết nối public API sẽ là bước tiếp theo.

### Chạy local

Cần Node.js 22.12+, PostgreSQL và một database development. Đặt các thông tin database/JWT/admin seed trong `server/.env` theo `server/.env.example`. Dùng JWT secret ngẫu nhiên ít nhất 32 bytes; mật khẩu seed dài ít nhất 12 ký tự, tối đa 72 bytes. Không đặt secret hoặc mật khẩu vào biến `VITE_*`.

Backend, từ root repository:

```sh
cd server
npm ci
cp .env.example .env
# Điền DATABASE_URL, JWT_SECRET, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD.
# FRONTEND_URL=http://localhost:5173; PORT=3000.
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Ở terminal khác, từ root repository:

```sh
npm ci
cp .env.example .env
# VITE_API_URL=http://localhost:3000; VITE_BASE_PATH=/.
npm run dev
```

Mở `http://localhost:5173/admin/login`, đăng nhập bằng tài khoản đã seed. Với setup đã có `.env`, giữ nguyên tệp đó; không ghi đè bằng tệp example. JWT chỉ lưu trong `sessionStorage` của tab; mật khẩu không được lưu. Trang quản trị kiểm tra hạn token, backend xác minh chữ ký; phản hồi 401 xóa phiên và đưa về đăng nhập. Logout xóa token. Thời hạn phiên theo backend hiện tại là 2 giờ.

### Build và deploy

```sh
npm run build
npm run preview
```

Production cần đặt `VITE_API_URL` vào địa chỉ backend thực tế trước khi build, và `FRONTEND_URL` của backend vào đúng origin frontend. Khi dùng subdirectory, đặt `VITE_BASE_PATH=/90s/` (có dấu `/` đầu và cuối), rồi truy cập `/90s/admin/login`. Static hosting phải trả `index.html` cho các đường dẫn React như `/admin/login` và `/admin/rooms`; API được phục vụ riêng bởi backend. CSS admin được giới hạn phạm vi, admin được tải riêng qua lazy import; các component/data/style công khai giữ nguyên.

### Kiểm thử trình duyệt với backend thật

`npm run test:admin` dùng Playwright, mở backend test ở port 3100 và Vite ở port 5175, chạy tuần tự. Không dùng API mock. Dùng một **database test riêng**, đã áp dụng migration và seed, không dùng database production. Truyền các biến môi trường từ cấu hình test riêng của bạn:

- `DATABASE_URL`, `JWT_SECRET`: kết nối và secret dành cho test.
- `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`: tài khoản đã seed trong database test.

Nếu chưa có Chromium, chạy `npx playwright install chromium`. Cấu hình tự dùng system Chromium ở `/usr/lib/chromium/chromium` khi có, hoặc có thể đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

```sh
npm run test:admin
```

Để kiểm tra bản production trên cùng backend test:

```sh
VITE_API_URL=http://localhost:3100 npm run build
E2E_USE_PREVIEW=1 npm run test:admin
```

Kiểm thử bao gồm đăng nhập đúng/sai, logout, route bảo vệ, dashboard, CRUD cho cả bốn nhóm, publish/unpublish, cài đặt, validation, phản hồi 401 thật, lỗi kết nối/retry, responsive 375/768/1440 px và thao tác website công khai sau khi rời admin. Dữ liệu CRUD tạm được xóa; cài đặt test được phục hồi. `test-results/` và `playwright-report/` được Git ignore. Kiểm thử backend hiện có vẫn chạy riêng theo `server/README.md`.

## Structure

- `src/main.jsx`: React root and CSS import.
- `src/App.jsx`: shared room/date state and modal routing.
- `src/components/`: Header, HeroSlider, About, Rooms, Restaurant, Cafe, Offers, News, ConsultationModal and Footer. Related detail views are exported alongside their section components.
- `src/data/data.js`: contacts, rooms, restaurant/cafe data, hero campaigns, news and asset/date helpers.
- `src/styles/styles.css`: original plain CSS, with asset paths adapted for Vite.
- `public/assets/images/`: hero, room/food/cafe collages, logo and news placeholder.
- `public/assets/fonts/`: Be Vietnam Pro fonts and SIL Open Font License.

## Features

- Room view/capacity filters, indicative prices, details and all-room view.
- Expected arrival/departure dates used solely as consultation context.
- Shared native dialog with Escape, focus containment and focus restoration.
- Room consultation preserves the selected room and expected stay context.
- Restaurant menu, cafe detail views and demo offers.
- Data-driven hero slider: six-second autoplay, previous/next, dots, pause, keyboard and swipe. Pauses on hover/focus and hidden tabs; reduced motion disables autoplay/transitions.
- Mobile navigation, news categories and client-side pagination at six articles per page.

## Official content to replace

Set `PLACEHOLDER_HOTLINE`, `PLACEHOLDER_ZALO_URL` and `PLACEHOLDER_FACEBOOK_URL` in `src/data/data.js`. Do not enter invented business details. Placeholder links are clearly marked unavailable and intercepted; configured hotline uses `tel:`, social links open with `noopener noreferrer`.

Replace demo room data, news titles/excerpts/dates/links and campaign content with approved information. News thumbnails and campaign images currently reuse the original hero photo. Add a campaign as one object in `HERO_SLIDES`. Store images under `public/assets/images/` and reference them as `assets/images/...` in data.

The uploaded ZIP had no image files and zero-byte fonts. Complete image/font assets were restored from the earlier supplied prototype; no empty assets are included. Collage quadrants preserve the original presentation. Fonts are self-hosted and licensed under `public/assets/fonts/OFL.txt`.

## Backend

The Express/PostgreSQL/Prisma CMS backend lives in `server/`; see [server/README.md](server/README.md) for database setup, migrations, seeding and API documentation. There is no booking engine, room availability or payment. The public website still uses its original local data and does not submit consultation information. Only the admin UI uses the CMS API in this phase.

## Repository

The React application lives at the repository root. Source, configuration, npm lockfile, assets and README are committed. `node_modules/` and generated `dist/` are ignored; run the commands above to reproduce them.
