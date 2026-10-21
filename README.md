# 90s Homestay — website và CMS

React 19 + Vite, Express 5, Prisma 6 và PostgreSQL. Website lấy nội dung qua API; admin ở `/admin`. Giữ phong cách thương hiệu hiện tại. Không có đặt phòng, kiểm tra phòng trống, thanh toán hay lưu yêu cầu tư vấn; các nút tư vấn mở kênh liên hệ hiện có.

## Cài mới

Cần Node.js ≥22.12, npm và PostgreSQL 17 (hoặc phiên bản PostgreSQL được Prisma 6 hỗ trợ). Chạy lệnh tại thư mục gốc repo. Giữ cả `server/` và `shared/` khi triển khai backend vì validation dùng chung.

Có thể chạy PostgreSQL bằng Docker (tự đặt biến `POSTGRES_PASSWORD` trong shell hoặc secret manager trước):

```bash
docker run -d --name 90s-postgres \
  -e POSTGRES_USER=cms -e POSTGRES_DB=homestay \
  -e POSTGRES_PASSWORD \
  -p 127.0.0.1:5432:5432 \
  -v 90s-postgres-data:/var/lib/postgresql/data postgres:17
npm ci
npm --prefix server ci
cp .env.example .env
cp server/.env.example server/.env
```

Điền cấu hình trong các file `.env` cục bộ, không commit:

| Biến                                      | Ý nghĩa                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`                            | URL PostgreSQL database ứng dụng đã tạo; tài khoản phải có quyền migration       |
| `JWT_SECRET`                              | Secret ngẫu nhiên tối thiểu 32 byte, ví dụ tạo bằng `openssl rand -hex 32`       |
| `PORT`                                    | Cổng API, mặc định 3000                                                          |
| `FRONTEND_URL`                            | Origin frontend chính xác, ví dụ `http://localhost:5173`, không dấu `/` cuối     |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Tài khoản tạo lần đầu; mật khẩu ≥12 ký tự, ≤72 byte; không dùng mật khẩu mẫu     |
| `UPLOAD_DIR`                              | Đường dẫn tuyệt đối tới thư mục media bền vững, tài khoản chạy server có quyền ghi |
| `VITE_API_URL`                            | Origin API, ví dụ `http://localhost:3000`; phải đặt trước khi build              |
| `VITE_BASE_PATH`                          | `/` mặc định; nếu dùng thư mục con phải bắt đầu và kết thúc bằng `/`             |

Tạo thư mục `UPLOAD_DIR` trên volume bền vững, rồi:

```bash
cd server
npx prisma validate
npm run prisma:generate
npm run migrate:deploy
npm run seed
npm start
```

Seed dành cho cài mới: tạo admin và dữ liệu ban đầu. Seed lặp lại không ghi đè bản ghi/password đã có, nhưng vẫn có thể thêm bản ghi mẫu còn thiếu; vì vậy không chạy seed thường xuyên trên website đang vận hành.

Mở terminal khác tại gốc repo:

```bash
npm run dev -- --host 0.0.0.0
curl --fail http://localhost:3000/api/health
```

Đăng nhập `/admin` bằng tài khoản đã cấu hình để quản lý nội dung. Theo yêu cầu bàn giao demo, website không hiển thị nhãn nội dung mẫu hoặc chờ xác nhận.

## Nâng cấp mà giữ dữ liệu

1. Sao lưu PostgreSQL (`pg_dump -Fc`) và thư mục media; xác minh bản sao lưu có thể phục hồi trên database riêng. Ghi lại cấu hình `.env`, quyền và mount volume.
2. Đưa mã mới lên; giữ nguyên database và `UPLOAD_DIR`. Cài dependency theo lockfile.
3. Chạy các lệnh bên dưới. Có 4 migration: bổ sung gallery/menu/document, bộ `media` cho phòng/hero/tin/nội dung và phụ đề phòng/bài viết và nội dung cà phê. Migration mới điền 16 bài mặc định cùng các trường thiếu của thẻ nội dung, chỉ thay giá trị mặc định cũ hoặc trường trống trên ID seed đã biết; giữ nội dung tự biên tập. **Không xóa `dishes`, `content`, `imageUrl`, `q` hoặc bản ghi cũ**.
4. Khởi động backend mới sau khi generate/migrate; build và triển khai frontend với đúng API origin. Kiểm tra health, đăng nhập, chỉnh thử một bản ghi và đối chiếu public.

```bash
npm ci
npm --prefix server ci
cd server
npx prisma validate
npm run prisma:generate
npm run migrate:deploy
npx prisma migrate status
cd ..
npm run build
```

**Không dùng `prisma migrate reset`, không reset database, không chạy seed để nâng cấp.** Không chỉnh migration đã áp dụng. Nếu cần quay lại phiên bản ứng dụng cũ, các cột mới vẫn tương thích với ứng dụng cũ; dữ liệu chỉnh bằng editor mới nằm trong các cột mới, nên chỉ bản mới hiển thị đầy đủ. Không tự động xóa các cột để rollback.

## Sử dụng CMS

- Danh sách phòng, hero, tin, nội dung có tìm kiếm, lọc trạng thái/nhóm, phân trang server và tổng số bản ghi. Có xác nhận xóa; sau xóa trang cuối được điều chỉnh.
- Chọn ảnh từ máy (JPEG/PNG/WebP, tối đa 8 MB), chờ upload hoàn tất rồi lưu. Khi upload, form chặn lưu và khóa thao tác thêm/xóa/đổi thứ tự khối ảnh/món; các trường độc lập vẫn sửa được. Rời form sẽ hủy request upload đang chạy. File được giải mã và tái mã hóa WebP, tối đa cạnh 2400 px; ảnh nguồn tối đa 40 triệu pixel. Có preview, thay, bỏ và thử lại. URL HTTP(S) hoặc assets cũ vẫn dùng được. SVG chỉ dùng assets/URL có sẵn; không nhận upload SVG.
- Phòng có ảnh chính và gallery: thêm ảnh, đưa lên, xóa khỏi gallery, hoặc chọn “Dùng làm ảnh đại diện”. Tham số collage cũ được giữ ở database nhưng không hiện trong thao tác thường ngày.
- Xóa hết món giữ thực đơn rỗng, không tự phục hồi tên món cũ. API cũ cập nhật tên món vẫn giữ giá/đơn vị/mô tả đã có cho các món trùng tên.
- Thực đơn là các món có tên, giá tùy chọn, đơn vị, mô tả, ảnh, bật/tắt và thứ tự. **Giá trống khác giá 0**. Nhãn chưa có giá nằm trong Cài đặt. Dữ liệu `dishes` cũ được giữ để tương thích.
- Tin tức có phụ đề và editor từng khối: đoạn văn, tiêu đề, danh sách (mỗi dòng một mục), ảnh, video; đậm/nghiêng/link áp dụng cả khối. Có preview. Không nhập HTML; chuỗi HTML được hiển thị như văn bản. Bài cũ vẫn giữ nguyên xuống dòng. Khi thêm khối đầu tiên, editor chuyển nội dung thuần hiện có thành đoạn văn để không mất nội dung. Khi có các khối, chúng được ưu tiên hiển thị; xóa hết khối sẽ trở về nội dung thuần cũ.
- Ngày hiển thị trên bài chỉ là thông tin mô tả, **không hẹn giờ**. “Đăng bài” công khai ngay; “Gỡ đăng” chặn API public. Slug mới tự gợi ý; slug bản ghi đang có không tự thay khi đổi tiêu đề. Trùng slug được báo lỗi; đổi slug đã chia sẻ sẽ làm link cũ mất hiệu lực.
- Cài đặt quản lý thương hiệu/logo/footer, liên hệ, thông báo, trạng thái cà phê, title/subtitle/description và bật/tắt section. Để trống các trường section sẽ dùng phần giới thiệu mặc định. Section dữ liệu rỗng tự ẩn và bỏ khỏi menu. CTA không dẫn tới section đã ẩn; thẻ nội dung vẫn còn và mở phần chi tiết tương ứng. Menu ở trang chi tiết cũng bỏ section rỗng.
- Ngày/số khách/view dự kiến được giữ trong sessionStorage của tab để mang sang tư vấn phòng và phục hồi khi Back. Chỉ là ngữ cảnh trao đổi, không kiểm tra phòng trống hay lưu yêu cầu lên server. Chuyên mục/trang tin nằm trong query `newsCategory`/`newsPage`, nên Back/Forward giữ đúng vị trí.
- Form ghi bản nháp vào localStorage theo tài khoản và màn hình/bản ghi. Sau refresh hoặc đăng nhập lại chọn “Khôi phục bản nháp”. Nếu phiên bản server khác, giao diện cảnh báo trước khi khôi phục; PATCH cũng kiểm tra phiên bản, tránh ghi đè một chỉnh sửa mới hơn. Phải đối chiếu/hợp nhất thủ công khi conflict.
- Điều hướng, hủy và đóng/refresh tab có cảnh báo thay đổi chưa lưu (beforeunload tùy trình duyệt). Lưu thành công hoặc chủ động bỏ sẽ xóa bản nháp tương ứng. Bản nháp ở trình duyệt hiện tại, không đồng bộ thiết bị và không lưu JWT vào localStorage. Trên máy dùng chung cần xóa dữ liệu trình duyệt sau khi hoàn tất; các bản nháp của tài khoản khác không tự được phục hồi.

## Lưu media và triển khai

`UPLOAD_DIR` phải nằm trên volume **ngoài `dist/` và thư mục release tạm**, ví dụ `/var/lib/90s-homestay/uploads`. Thư mục mặc định khi chạy trong `server/` là `server/storage/uploads`; không phù hợp môi trường container mất dữ liệu sau redeploy nếu không mount volume.

Backend trả `/uploads/<uuid>.webp`, `.mp4` hoặc `.webm`; frontend tự nối API origin nên chạy được khi FE và BE khác origin. API xác thực upload trước khi đọc file, kiểm tra MIME và giải mã nội dung; không dùng tên file người dùng. Header `Cross-Origin-Resource-Policy: cross-origin` áp dụng cho media; CORS API chỉ cho `FRONTEND_URL`. Đặt HTTPS cho cả hai origin khi triển khai. Reverse proxy không được thay CORP ảnh thành `same-origin`.

Bỏ/thay ảnh chỉ đổi liên kết trong nội dung, **không xóa file vật lý** vì ảnh có thể được dùng chung hoặc còn nằm trong bản nháp. Backup ảnh cùng database. Dọn ảnh không tham chiếu là thao tác vận hành thủ công sau khi đối chiếu toàn bộ nội dung và bản sao lưu; không có tác vụ GC tự chạy. Phiên bản này dùng filesystem, chưa tích hợp S3/CDN; nhiều backend replica cần shared volume.

Ví dụ Nginx khi FE và API cùng domain (thay đường dẫn build/cổng phù hợp):

```nginx
server {
    listen 443 ssl;
    server_name example.com;
    root /srv/90s/dist;
    client_max_body_size 55m;
    # Cấu hình ssl_certificate và ssl_certificate_key của domain.
    location /api/ { proxy_pass http://127.0.0.1:3000; }
    location /uploads/ { proxy_pass http://127.0.0.1:3000; }
    location / { try_files $uri $uri/ /index.html; }
}
```

`/phong/:slug`, `/tin-tuc/:slug`, `/noi-dung/:id`, `/admin/*` cần fallback `index.html`; `/api` và `/uploads` phải được chuyển tới backend, không trả HTML. Khi deploy khác domain, cấu hình tương tự trên API domain và đặt `FRONTEND_URL` bằng FE origin. Hosting tĩnh cũng cần SPA rewrite tương đương. Thư mục con cần fallback về `<base>/index.html`.

Trang chi tiết cập nhật title, description, canonical và Open Graph bằng JavaScript. Đây là **CSR**, crawler/social preview không chạy JS có thể chỉ thấy metadata trong HTML gốc. Trang 404 của SPA là trạng thái giao diện, hosting fallback thường vẫn trả HTTP 200. Muốn SEO/social preview và HTTP status đầy đủ cần prerender/SSR hoặc xử lý hosting riêng; chưa triển khai trong bản này.

## API

Public, không gửi JWT:

- `GET /api/health`
- `GET /api/rooms`, `GET /api/rooms/:slug` (chỉ phòng bật)
- `GET /api/hero-slides`
- `GET /api/news?page=1&limit=6&category=90s`, `GET /api/news/:slug` (chỉ đã đăng)
- `GET /api/content/:section` (`restaurant`, `cafe`, `promotion`, `experience`)
- `GET /api/content/item/:id` (chỉ nội dung bật)
- `GET /api/site-config`

Admin: `POST /api/admin/login` nhận `{email,password}`, trả JWT hạn 2 giờ. Các endpoint sau cần `Authorization: Bearer <token>`:

- `GET/POST /api/admin/{rooms|hero-slides|news|content}`
- `GET/PATCH/DELETE /api/admin/{resource}/:id`
- `GET/PATCH /api/admin/site-config`
- `POST /api/admin/uploads`, multipart field `image`, trả `{url}`.
- `POST /api/admin/uploads/video`, multipart field `video`, trả `{url}`.

Danh sách CMS dùng `page`, `limit` (≤50), `search` (≤200 ký tự), `status=true|false`, `category` cho news hoặc `section` cho content. Kết quả `{data,pagination:{page,limit,total,totalPages}}`. API GET danh sách không query vẫn trả array để tương thích client cũ; UI mới luôn dùng phân trang. PATCH editor gửi `_version` là `updatedAt` đã đọc; PATCH settings gửi `_snapshot` là object cấu hình đã đọc, trả 409 nếu có thay đổi. API lỗi không trả chi tiết database.

Các model Prisma: `Admin`, `Room`, `HeroSlide`, `News`, `ContentCard`, `SiteConfig`. Media/gallery/rich document/menu là JSON có validator whitelist tại `shared/content.js`; không lưu HTML tùy ý.

## Kiểm thử

Tạo **database test riêng có tên kết thúc `_test`**, cấu hình DATABASE_URL/JWT_SECRET/SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD trong môi trường shell an toàn, rồi migrate/seed database đó. Không trỏ test vào production; test có CRUD và fault injection đổi tên bảng tạm thời trên DB test.

```bash
cd server
npm run prisma:generate
npm run migrate:deploy
npm run seed
RUN_DB_TESTS=1 npm test
cd ..
# E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD là cùng tài khoản seed của DB test.
# Cần Chromium của hệ thống hoặc cài bằng: npx playwright install chromium
npm run test:e2e
# Hoặc kiểm thử bundle production, với API test cổng 3100:
VITE_API_URL=http://localhost:3100 npm run build
E2E_USE_PREVIEW=1 npm run test:e2e
git diff --check
```

Playwright tự mở API cổng 3100 và FE cổng 5175, chạy tuần tự. Nếu hệ thống không có Chromium tại `/usr/lib/chromium/chromium`, dùng browser Playwright đã cài hoặc biến `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Không bật `RUN_DB_TESTS=1` thì test tích hợp DB bị skip, không phải pass. Khi test lỗi timeout có thể cần xóa **chỉ bản ghi QA được test tạo** trên DB test trước khi chạy lại; không reset DB ứng dụng.

Xem [kết quả kiểm thử](docs/KET-QUA-KIEM-THU.md), [bảng đối chiếu yêu cầu](docs/DOI-CHIEU-YEU-CAU.md) và [nội dung vận hành](docs/NOI-DUNG-CAN-XAC-NHAN.md).

## Đóng gói

Chạy `python3 scripts/package-source.py` để tạo ZIP trong thư mục được chỉ định. Script lấy mã nguồn và tài sản cần thiết, loại Git, node_modules, dist, test-results, uploads và mọi `.env` bí mật; chỉ giữ `.env.example`. ZIP không bao gồm database hay ảnh do người dùng upload: backup/chuyển các dữ liệu vận hành đó riêng.

## Hiển thị liên hệ

Trong **CMS → Cài đặt**, nhập Hotline, Liên kết Zalo và (nếu cần) Số điện thoại Zalo. Nút hotline hiển thị kèm số; nút Zalo lấy số từ trường riêng hoặc tự lấy từ liên kết `https://zalo.me/<số điện thoại>`. Không tự dùng số hotline cho tài khoản Zalo khác. Facebook giữ cách hiển thị hiện tại.

Website không hiển thị nhãn nội dung mẫu/chờ xác nhận. Thông báo mẫu từ bản cũ được ẩn tự động, không cần chạy seed hay sửa database; thông báo kinh doanh riêng vẫn hiển thị.

## Nội dung và ảnh/video

- 16 bài viết ban đầu có tiêu đề, phụ đề, tóm tắt, nội dung đầy đủ, ảnh và liên kết tới hạng phòng. Nguồn biên tập nằm tại `server/prisma/editorial-data.js`; sửa bài trong CMS sẽ được lưu vào database. Không cần chạy seed để nhận nội dung mới khi nâng cấp; migration điền các bản ghi mặc định cũ.
- Phòng, hero, tin và thẻ nội dung có **Ảnh và video**, tối đa 30 mục. Thêm mục, chọn loại, tải file hoặc dán URL file trực tiếp, thêm chú thích/poster, đổi thứ tự hoặc xóa. Mục đầu làm media chính; khi có bộ media mới, ảnh/gallery cũ vẫn giữ trong database nhưng không được chèn vào bộ mới. Xóa hết bộ media mới sẽ dùng ảnh/gallery cũ.
- Video upload: MP4 H.264 hoặc WebM VP8/VP9/AV1, tối đa 50 MB và 10 phút, kích thước tối đa 8192 px. Backend dùng ffprobe đi kèm npm để kiểm tra container/codec/thời lượng, không cần cài ffmpeg hệ thống. Có kiểm tra MIME, file thật và dọn file tạm khi từ chối. File đã lưu hỗ trợ HTTP Range. URL phải là file `.mp4`/`.webm`; không dùng URL trang YouTube/Facebook làm file video.
- Video không tự phát tiếng. Ở trang chi tiết có điều khiển phát/dừng/âm lượng. Thumbnail trong thẻ chỉ xem trước; bấm mở chi tiết để phát. Mỗi media trong hero thành một slide, video dừng khi đổi slide; không tự chuyển đi giữa lúc xem video.
- Thẻ nội dung có trang riêng `/noi-dung/:id`, ảnh/video, tiêu đề/phụ đề/mô tả, thời gian cập nhật và CTA. Các popup nhà hàng/cà phê/ưu đãi có liên kết mở trang này. CTA có thể dẫn tới `/phong/<slug>`, `/tin-tuc/<slug>`, `/noi-dung/<id>`, section hoặc HTTP(S).
- Ngày giờ cập nhật do server tự ghi mỗi lần lưu; ngày đăng bài có trường riêng, không phải hẹn giờ. CMS hiển thị giờ cập nhật và liên kết mở nội dung đã lưu; bản nháp/chưa bật sẽ không xuất hiện trên public.
