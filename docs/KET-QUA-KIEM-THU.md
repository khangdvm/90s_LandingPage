# Kết quả kiểm thử — 21/10/2026

Nguồn checkout đang sửa, Node.js 24.19, Prisma 6.19.3, PostgreSQL 17.11 và Chromium hệ thống. Không dùng database production. Dữ liệu tài khoản/secret test nằm ngoài repository và không nằm trong ZIP.

| Kiểm tra                           | Kết quả thực tế                                                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Cài dependency backend             | Thành công, cập nhật lockfile cho Multer và Sharp                                                                                             |
| `prisma validate`                  | Đạt                                                                                                                                           |
| `prisma generate`                  | Đạt, Prisma Client 6.19.3                                                                                                                     |
| Nâng cấp schema cũ                 | Đạt trên `cms_upgrade_20261021_test`: áp dụng migration cũ, seed mẫu, rồi migration mới; không reset                                          |
| Bảo toàn dữ liệu sau nâng cấp      | 4 phòng, 3 hero, 16 bài và 4 nhóm nhà hàng còn nguyên số lượng; tất cả tên món được chuyển sang menuItems, giá vẫn null; dishes cũ còn nguyên |
| Cài mới cả 2 migration + seed      | Đạt trên `cms_delivery_20261021_test`                                                                                                         |
| `prisma migrate status`            | Database up to date, đủ 2 migration                                                                                                           |
| `prisma migrate diff --exit-code`  | No difference detected, mã thoát 0                                                                                                            |
| Backend test có `RUN_DB_TESTS=1`   | **18 passed, 0 failed, 0 skipped**                                                                                                            |
| Frontend production build          | **Đạt**, Vite 7.3.7, API test cổng 3100                                                                                                       |
| Playwright trên production preview | **29 passed, 0 failed, 0 skipped**, 52,9 giây, 1 worker                                                                                       |
| `git diff --check`                 | Đạt                                                                                                                                           |
| ZIP                                | Kiểm tra tính toàn vẹn và danh mục loại trừ sau đóng gói; không chứa env thật/Git/node_modules/dist/uploads/test-results                      |

## Các luồng đã thực sự chạy

- `/api/health`, đăng nhập đúng/sai, JWT không hợp lệ/hết hạn, route admin được bảo vệ, CORS, malformed JSON và lỗi database không lộ chi tiết.
- CRUD phòng/hero/tin/thẻ nội dung; bật/tắt/đăng/gỡ đăng; public phản ánh thay đổi; thứ tự và phân trang theo category.
- Regression Zalo anchor, ảnh anchor, CTA assets; scheme nguy hiểm, traversal và URL credentials bị chặn.
- API upload chưa xác thực, file giả ảnh, SVG và file >8 MB bị từ chối; ảnh PNG thật được chuyển WebP; HTTP ảnh trả CORP cross-origin.
- Browser chọn file thật, preview, ảnh chính/gallery, đổi thứ tự, chọn ảnh đại diện, trang detail và refresh/Back/canonical/404/phòng ẩn.
- Rich editor heading/đoạn đậm/danh sách nghiêng/link/ảnh và preview; chuỗi script vẫn là văn bản, không chạy JS; nháp không lộ public; slug bản ghi đã đăng không tự đổi khi sửa tiêu đề.
- Thực đơn giá null và 0, chỉnh sửa từ CMS ra public; nhãn thiếu giá quản lý trong settings.
- Bật/tắt section và nav, thương hiệu/footer/thông báo/tiêu đề quản lý từ settings; xác nhận dữ liệu mẫu là hành động rõ ràng của chủ website.
- Draft refresh, login sau 401 thực tế, điều hướng chấp nhận/từ chối, xung đột settings không ghi đè. Kiểm tra thêm timer JWT sau 2 giờ bằng đồng hồ trình duyệt điều khiển; API vẫn là backend thật, không mock.
- Tìm kiếm/lọc/phân trang server từ UI; xóa bản ghi cuối trang 2 tự về trang 1.
- Mobile 320/375, tablet 768 và desktop 1440 px: form/table/gallery/menu/modal, nội dung dài, ảnh 404 thật, nhiều phòng; sidebar tối đa 3 phòng và modal xem tất cả đầy đủ.
- Section rỗng không khôi phục fixture; lỗi DB thật (đổi tên bảng tạm trên DB test) có trạng thái lỗi và retry; hero giữ keyboard/swipe/pause/autoplay/reduced motion.

Các lỗi ở các vòng đầu đã được sửa; số liệu trên lấy từ vòng kiểm tra hoàn tất sau cùng. Không dùng test skip hoặc API mock để kết luận các luồng chính đã đạt.

## Phần chưa xác minh hoặc giới hạn

- Chưa chạy Safari, Firefox, thiết bị iOS/Android thật, tải lớn hoặc kiểm thử thâm nhập chuyên sâu. Không suy rộng kết quả Chromium thành hỗ trợ mọi trình duyệt.
- Chưa triển khai lên hosting thật; cấu hình Nginx/HTTPS/volume cần người vận hành áp dụng theo README. Production preview chỉ chứng minh bundle đã build và SPA routes trên preview server hoạt động.
- CSR chưa đảm bảo social crawler nhận metadata động; HTTP 404 thực tế phụ thuộc hosting. Không có SSR/prerender.
- Editor định dạng theo khối; không phải trình soạn thảo văn bản đầy đủ. Chưa có hẹn giờ xuất bản.
- Upload filesystem cần shared volume nếu chạy nhiều replica. Không tự xóa file; dữ liệu ảnh vận hành không đi kèm ZIP mã nguồn.
- Bản nháp chỉ tồn tại trong localStorage của trình duyệt; xóa dữ liệu trình duyệt hoặc hỏng thiết bị làm mất bản nháp. Cảnh báo đóng tab do trình duyệt quyết định.
- Dữ liệu kinh doanh chưa được chủ website xác nhận trong đợt phát triển này. Nhãn mẫu mặc định được giữ; xem danh sách xác nhận riêng.
