# Kết quả kiểm thử — 21/10/2026

Node.js 24.19, Prisma 6.19.3, PostgreSQL 17.11 và Chromium hệ thống. API thật và production preview; không dùng database production, không giả response thành công. Tài khoản/secret test nằm ngoài repository.

| Kiểm tra | Kết quả |
| --- | --- |
| Prisma validate/generate | Đạt, Prisma Client 6.19.3 |
| Schema/database diff | No difference detected, mã thoát 0 |
| Cài mới | 4 migration + seed trên `cms_media_install_20261021_test` |
| Nâng cấp từ bản cũ | `cms_media_upgrade_test`: 4 phòng/3 slide/16 bài/10 thẻ còn nguyên; bài mặc định được điền nội dung |
| Giữ chỉnh sửa riêng | Giữ title/body/excerpt/image/contentDoc của bài đã sửa và thông báo kinh doanh riêng |
| Backend, RUN_DB_TESTS=1 | **22 passed, 0 failed, 0 skipped** |
| Frontend production build | Đạt, Vite 7.3.7; API test cổng 3100 |
| Playwright tổng thể | 52/53 đạt; ca còn lại kiểm tra câu tư vấn cũ, đã cập nhật assertion |
| Playwright xác minh sau chỉnh cuối | **11 passed, 0 failed, 0 skipped** trên build cuối |
| Phạm vi trình duyệt | **54 ca độc nhất có kết quả đạt**, gộp lượt tổng thể và lượt chạy lại các luồng bị ảnh hưởng |
| git diff --check | Đạt |

## Các luồng được kiểm tra

- Health, đăng nhập đúng/sai, bảo vệ route, 401/JWT hết hạn, CORS và lỗi không lộ thông tin database/filesystem.
- CRUD phòng/hero/tin/nội dung, bật/tắt/đăng/gỡ đăng, lọc/tìm kiếm/phân trang server, xóa bản ghi cuối trang.
- Chỉnh sửa đồng thời trả 409, bản nháp theo tài khoản, khôi phục sau refresh/đăng nhập lại, cảnh báo rời trang, Back/Forward khớp URL.
- Upload ảnh thật, từ chối file giả/SVG/quá kích thước; registry chặn lưu/đổi cấu trúc khi upload; retry không gán file sang mục khác.
- Upload MP4 H.264 và WebM, từ chối file giả/sai container/quá 50 MB; dọn file tạm. Kiểm tra HTTP Range trả 206 và header media khác origin.
- Browser giải mã và phát video thật, chuyển ảnh/video, sắp xếp thứ tự từ CMS, mobile 320 px, slider dừng video khi đổi slide, không autoplay tiếng.
- Video trong bài viết: editor/preview/public; chuyển văn bản cũ thành đoạn khi thêm khối để giữ nội dung. Link trong bài mở hạng phòng hoặc section thật.
- 16 bài có title/subtitle/excerpt/body/ảnh/link; trang chi tiết hiển thị ngày giờ. Thẻ nội dung có URL riêng, CTA sang phòng và 404 khi ẩn.
- Menu phân biệt giá trống với giá 0, giữ metadata khi client cũ sửa tên món; xóa hết món không phục hồi danh sách cũ.
- Hotline/Zalo hiện số, Facebook giữ liên kết; thông báo mẫu cũ được ẩn và thông báo kinh doanh riêng vẫn hiển thị.
- Section rỗng/tắt bị bỏ khỏi navigation, lỗi nguồn riêng biệt có retry; thiếu ảnh không làm hỏng trang.
- Khôi phục bản nháp từ trước khi có trường media/subtitle: giữ nội dung đã soạn, dùng giá trị hiện tại cho trường mới, bỏ trường không còn sử dụng.
- Giữ ngày/số khách khi xem phòng/tư vấn/Back, giữ chuyên mục/trang tin khi trở lại. Responsive admin và public, bàn phím/swipe/giảm chuyển động.

## Phạm vi kết luận

Kết quả áp dụng cho Chromium và production preview. Chưa chạy Safari/Firefox/thiết bị thật, kiểm thử tải hoặc kiểm thử thâm nhập; chưa triển khai hosting thực tế. Metadata là CSR, không phải SSR/prerender. Video dùng file MP4/WebM trực tiếp, không nhúng trang YouTube/Facebook. Ngày đăng không tự hẹn giờ xuất bản. Upload cần volume bền vững; không tự xóa media đang lưu. Không bổ sung đặt phòng, thanh toán hoặc lưu yêu cầu tư vấn.

Môi trường dùng chung có lần timeout làm cleanup qua browser request bị đóng; cleanup ca hero đã chuyển sang Prisma riêng trên DB test. Fixture bài thuần được tạo riêng thay vì dựa vào bài seed nay đã có định dạng. Test chọn đúng trường title khi thêm subtitle. Artifact lỗi được tự che mật khẩu/JWT secret; không dùng tài khoản production.

Lượt cuối bổ sung xác minh ảnh món/giá 0 và tư vấn đúng bữa ăn ở trang nội dung nhà hàng, nút quay về danh sách phòng, liên kết section trong bài, cùng các luồng draft/conflict sau cập nhật hook khôi phục. Không bỏ qua ca lỗi để kết luận hoàn tất.
