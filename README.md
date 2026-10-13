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

**Website công khai đã kết nối CMS.** Nhân viên sửa nội dung trong `/admin`, lưu, rồi tải lại website công khai để thấy thay đổi. Website lấy dữ liệu mới từ API khi mở/tải lại trang; không cần sửa React source. Chỉ nội dung đang bật hoặc bài viết đã đăng được hiển thị.

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

Production cần đặt `VITE_API_URL` vào địa chỉ backend thực tế trước khi build, và `FRONTEND_URL` của backend vào đúng origin frontend. Khi dùng subdirectory, đặt `VITE_BASE_PATH=/90s/` (có dấu `/` đầu và cuối), rồi truy cập `/90s/admin/login`. Static hosting phải trả `index.html` cho các đường dẫn React như `/admin/login` và `/admin/rooms`; API được phục vụ riêng bởi backend. CSS admin được giới hạn phạm vi, admin được tải riêng qua lazy import; website công khai giữ bố cục, lớp CSS và tương tác hiện tại, với dữ liệu lấy từ CMS.

### Kiểm thử trình duyệt với backend thật

`npm run test:e2e` dùng Playwright, mở backend test ở port 3100 và Vite ở port 5175, chạy tuần tự. Không dùng API mock. Dùng một **database test riêng có tên kết thúc bằng `_test`**, đã áp dụng migration và seed, không dùng database production. User database test cần quyền đổi tên bảng để kiểm tra lỗi endpoint thật; bảng luôn được phục hồi sau kiểm thử. Truyền các biến môi trường từ cấu hình test riêng của bạn:

- `DATABASE_URL`, `JWT_SECRET`: kết nối và secret dành cho test.
- `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`: tài khoản đã seed trong database test.

Nếu chưa có Chromium, chạy `npx playwright install chromium`. Cấu hình tự dùng system Chromium ở `/usr/lib/chromium/chromium` khi có, hoặc có thể đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

```sh
npm run test:e2e
# Hoặc chạy riêng: npm run test:admin / npm run test:public
```

Để kiểm tra bản production trên cùng backend test:

```sh
VITE_API_URL=http://localhost:3100 npm run build
E2E_USE_PREVIEW=1 npm run test:e2e
# Hoặc chạy riêng: npm run test:admin / npm run test:public
```

Kiểm thử bao gồm đăng nhập đúng/sai, logout, route bảo vệ, dashboard, CRUD cho cả bốn nhóm, publish/unpublish, cài đặt, validation, phản hồi 401 thật, lỗi kết nối/retry, responsive 375/768/1440 px và thao tác website công khai sau khi rời admin. Bộ public còn kiểm tra admin → database → public cho phòng, hero, tin tức, liên hệ/SEO và cả bốn nhóm nội dung; kết quả API rỗng; lỗi database thật và retry; viewport 320 px; keyboard/swipe/pause/autoplay/reduced-motion của slider. Dữ liệu CRUD tạm được xóa; cài đặt test được phục hồi. `test-results/` và `playwright-report/` được Git ignore. Kiểm thử backend hiện có vẫn chạy riêng theo `server/README.md`.

## Structure

- `src/main.jsx`: React root and CSS import.
- `src/App.jsx`: shared room/date state and modal routing.
- `src/components/`: Header, HeroSlider, About, Rooms, Restaurant, Cafe, Offers, News, ConsultationModal and Footer. Related detail views are exported alongside their section components.
- `src/api/`: API URL dùng chung, public client, endpoint helpers và adapters.
- `src/hooks/usePublicResource.js`: tải dữ liệu độc lập theo section, abort request cũ, trạng thái loading/error và retry.
- `src/data/data.js`: helper ảnh, ngày, giá và nhãn view; không có dữ liệu CMS chính.
- `src/data/SiteConfigContext.jsx`: chia sẻ cài đặt liên hệ từ public API.
- `src/data/demoFixtures.js`: fixture lịch sử để kiểm tra seed; không được import vào website đang chạy.
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
- Mobile navigation, news categories and server pagination at six articles per page.

## Cập nhật nội dung chính thức

Thay các giá trị `PLACEHOLDER_*` trong `/admin/settings` bằng Hotline, URL Zalo/Facebook và địa chỉ/bản đồ đã được xác nhận. Kênh chưa có thông tin được đánh dấu chưa cập nhật và không điều hướng. Hotline dùng `tel:`, liên kết ngoài dùng `target="_blank"` và `rel="noopener noreferrer"`.

Thay thông tin phòng, mô tả/giá/ảnh/sức chứa, các bài viết mẫu và chiến dịch trong các trang admin tương ứng. Tạo chiến dịch mới ở `/admin/hero`; không thêm object vào React source. Ảnh dùng URL HTTP(S) hoặc đường dẫn `assets/images/...` đã được phục vụ. Chưa có upload ảnh trong giai đoạn này.

## Public API integration

Nguồn dữ liệu chính duy nhất khi website chạy là CMS. Các endpoint:

- `GET /api/rooms`, `GET /api/rooms/:slug` cho danh sách, bộ lọc và modal chi tiết phòng.
- `GET /api/hero-slides` cho slider theo đúng thứ tự backend.
- `GET /api/news?category=90s|tam-dao&page=…&limit=6`, `GET /api/news/:slug` cho pagination và modal nội dung đầy đủ.
- `GET /api/content/restaurant|cafe|promotion|experience` cho các section đã định nghĩa.
- `GET /api/site-config` cho liên hệ, địa chỉ/bản đồ, `document.title` và meta description.

Public client chỉ gửi GET, không đọc sessionStorage, không đính kèm JWT/cookie và dùng `cache: no-store`. API URL được chia sẻ với admin qua `VITE_API_URL`; CORS của backend vẫn kiểm soát bằng `FRONTEND_URL`.

Adapters ánh xạ `maxGuests` → `guests`, `viewType` → `view`, `imageUrl` → `image`; giữ `count`, `q` và `dishes`. `count` là mô tả tổng số phòng, không phải phòng trống. Ảnh collage hiện tại dùng q 0–3; ảnh thông thường hiển thị toàn khung với cover. Restaurant/café dùng card đầu tiên theo sortOrder làm card nổi bật và hiển thị các card còn lại theo thứ tự trong layout sẵn có. Các chương trình ưu đãi xuất hiện trong modal hiện tại; các thẻ experience dùng khối giới thiệu hiện tại.

Không có fallback dữ liệu CMS ở runtime. API thành công với `[]` hoặc cấu hình trống được tôn trọng; fixture demo không tự xuất hiện lại. Khi request lỗi/timeout hoặc response không hợp lệ, section hiển thị thông báo tiếng Việt và nút thử lại, các section khác tiếp tục hoạt động. Request cũ được abort khi đổi chuyên mục/trang hoặc rời website. Pagination dùng `data` và `pagination` của backend, không lọc/cắt mảng tin tức cục bộ. Nội dung bài viết là văn bản thuần, không dùng HTML injection. Liên kết và URL ảnh chỉ dùng các scheme an toàn.

The uploaded ZIP had no image files and zero-byte fonts. Complete image/font assets were restored from the earlier supplied prototype; no empty assets are included. Collage quadrants preserve the original presentation. Fonts are self-hosted and licensed under `public/assets/fonts/OFL.txt`.

## Backend

The Express/PostgreSQL/Prisma CMS backend lives in `server/`; see [server/README.md](server/README.md) for database setup, migrations, seeding and API documentation. There is no booking engine, room availability or payment. Both the public website and admin UI use the CMS APIs. Room/date actions remain consultation only and do not submit booking information.

## Repository

The React application lives at the repository root. Source, configuration, npm lockfile, assets and README are committed. `node_modules/` and generated `dist/` are ignored; run the commands above to reproduce them.
