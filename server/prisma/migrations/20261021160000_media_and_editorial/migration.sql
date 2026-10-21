-- Additive media support. Existing image/gallery/content fields remain intact.

ALTER TABLE "Room" ADD COLUMN "media" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "HeroSlide" ADD COLUMN "media" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "News" ADD COLUMN "media" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "ContentCard" ADD COLUMN "media" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "Room" ADD COLUMN "subtitle" TEXT NOT NULL DEFAULT '';

ALTER TABLE "News" ADD COLUMN "subtitle" TEXT NOT NULL DEFAULT '';

-- Editorial backfill only targets known seed IDs and unchanged default/empty fields.

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Một điểm hẹn giữa núi' THEN 'Một điểm hẹn giữa núi' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Dành một khoảng nghỉ cho mình ở Tam Đảo' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Đôi khi một chuyến đi không cần lịch trình dày đặc. Chỉ cần rời nhịp phố, tìm một căn phòng hợp với số người và dành buổi chiều để ngắm mây, bạn đã có một khởi đầu dễ chịu ở Tam Đảo.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Đôi khi một chuyến đi không cần lịch trình dày đặc. Chỉ cần rời nhịp phố, tìm một căn phòng hợp với số người và dành buổi chiều để ngắm mây, bạn đã có một khởi đầu dễ chịu ở Tam Đảo."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Chọn hướng nhìn và sức chứa trước khi chọn hạng phòng.\nMang theo áo khoác nhẹ để dùng khi trời chuyển lạnh.\nChừa thời gian cho một bữa ăn chung thay vì di chuyển liên tục."},{"type":"image","src":"assets/images/hero/hero-01.png","text":"Dành một khoảng nghỉ cho mình ở Tam Đảo"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Hãy xem các hạng phòng tại 90s, ghi lại ngày đi và trao đổi với đội ngũ tư vấn để chọn không gian phù hợp. Một kế hoạch vừa đủ sẽ để lại nhiều thời gian hơn cho những người đi cùng."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Đôi khi một chuyến đi không cần lịch trình dày đặc. Chỉ cần rời nhịp phố, tìm một căn phòng hợp với số người và dành buổi chiều để ngắm mây, bạn đã có một khởi đầu dễ chịu ở Tam Đảo.

Gợi ý cho chuyến đi

Chọn hướng nhìn và sức chứa trước khi chọn hạng phòng.
Mang theo áo khoác nhẹ để dùng khi trời chuyển lạnh.
Chừa thời gian cho một bữa ăn chung thay vì di chuyển liên tục.

Chuẩn bị theo cách của bạn

Hãy xem các hạng phòng tại 90s, ghi lại ngày đi và trao đổi với đội ngũ tư vấn để chọn không gian phù hợp. Một kế hoạch vừa đủ sẽ để lại nhiều thời gian hơn cho những người đi cùng.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/hero/hero-01.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = '90s-1' AND ("title" = '[Bài mẫu] Một điểm hẹn giữa núi' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Gợi ý cho một ngày thong thả' THEN 'Gợi ý cho một ngày thong thả' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Một lịch trình nhẹ nhàng từ sáng đến tối' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Bắt đầu ngày mới bằng bữa sáng, một ly đồ uống yêu thích và khoảng thời gian nhìn ra ngoài cửa sổ. Thay vì cố ghé thật nhiều nơi, bạn có thể chọn một điểm đi dạo rồi dành phần còn lại trong ngày cho nghỉ ngơi.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Bắt đầu ngày mới bằng bữa sáng, một ly đồ uống yêu thích và khoảng thời gian nhìn ra ngoài cửa sổ. Thay vì cố ghé thật nhiều nơi, bạn có thể chọn một điểm đi dạo rồi dành phần còn lại trong ngày cho nghỉ ngơi."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Buổi sáng: ăn sáng và kiểm tra thời tiết trước khi ra ngoài.\nBuổi chiều: chọn một góc ngồi, đọc sách hoặc trò chuyện.\nBuổi tối: quây quần bên bữa ăn, chuẩn bị lịch trình ngày sau."},{"type":"image","src":"assets/images/rooms/rooms-collage.png","text":"Một lịch trình nhẹ nhàng từ sáng đến tối"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Lịch trình này là gợi ý linh hoạt. Hãy điều chỉnh theo thời tiết, sức khỏe và sở thích của nhóm; thông báo trước nhu cầu ăn uống để chuyến đi thuận tiện hơn."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Bắt đầu ngày mới bằng bữa sáng, một ly đồ uống yêu thích và khoảng thời gian nhìn ra ngoài cửa sổ. Thay vì cố ghé thật nhiều nơi, bạn có thể chọn một điểm đi dạo rồi dành phần còn lại trong ngày cho nghỉ ngơi.

Gợi ý cho chuyến đi

Buổi sáng: ăn sáng và kiểm tra thời tiết trước khi ra ngoài.
Buổi chiều: chọn một góc ngồi, đọc sách hoặc trò chuyện.
Buổi tối: quây quần bên bữa ăn, chuẩn bị lịch trình ngày sau.

Chuẩn bị theo cách của bạn

Lịch trình này là gợi ý linh hoạt. Hãy điều chỉnh theo thời tiết, sức khỏe và sở thích của nhóm; thông báo trước nhu cầu ăn uống để chuyến đi thuận tiện hơn.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/rooms/rooms-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = '90s-2' AND ("title" = '[Bài mẫu] Gợi ý cho một ngày thong thả' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Những góc nhìn trong chuyến đi' THEN 'Những góc nhìn trong chuyến đi' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Chọn khung cảnh hợp với cách bạn nghỉ ngơi' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Có người thích nhìn về thung lũng, có người lại muốn cảm nhận nhịp sống của thị trấn. Hướng nhìn của căn phòng là một phần nhỏ nhưng có thể tạo nên cảm giác rất riêng cho kỳ nghỉ.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Có người thích nhìn về thung lũng, có người lại muốn cảm nhận nhịp sống của thị trấn. Hướng nhìn của căn phòng là một phần nhỏ nhưng có thể tạo nên cảm giác rất riêng cho kỳ nghỉ."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Xem ảnh phòng và đọc mô tả giường, số khách trước khi chọn.\nChụp ảnh vào lúc ánh sáng mềm và tránh chắn lối đi chung.\nGiữ một vài khoảng thời gian không dùng điện thoại để tận hưởng khung cảnh."},{"type":"image","src":"assets/images/cafe/cafe-collage.png","text":"Chọn khung cảnh hợp với cách bạn nghỉ ngơi"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Ảnh và thông tin từng hạng phòng được giới thiệu trong mục Phòng nghỉ. Nếu có nhu cầu cụ thể về vị trí hoặc cách bố trí, hãy trao đổi khi nhận tư vấn."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Có người thích nhìn về thung lũng, có người lại muốn cảm nhận nhịp sống của thị trấn. Hướng nhìn của căn phòng là một phần nhỏ nhưng có thể tạo nên cảm giác rất riêng cho kỳ nghỉ.

Gợi ý cho chuyến đi

Xem ảnh phòng và đọc mô tả giường, số khách trước khi chọn.
Chụp ảnh vào lúc ánh sáng mềm và tránh chắn lối đi chung.
Giữ một vài khoảng thời gian không dùng điện thoại để tận hưởng khung cảnh.

Chuẩn bị theo cách của bạn

Ảnh và thông tin từng hạng phòng được giới thiệu trong mục Phòng nghỉ. Nếu có nhu cầu cụ thể về vị trí hoặc cách bố trí, hãy trao đổi khi nhận tư vấn.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/cafe/cafe-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = '90s-3' AND ("title" = '[Bài mẫu] Những góc nhìn trong chuyến đi' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Một bữa ăn cùng nhau' THEN 'Một bữa ăn cùng nhau' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Thêm thời gian quây quần vào lịch nghỉ' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Sau một ngày di chuyển, bữa ăn chung là lúc mọi người cùng ngồi lại và kể chuyện. Một thực đơn vừa khẩu vị, chia phần hợp lý và được trao đổi trước sẽ giúp nhóm có trải nghiệm thoải mái hơn.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Sau một ngày di chuyển, bữa ăn chung là lúc mọi người cùng ngồi lại và kể chuyện. Một thực đơn vừa khẩu vị, chia phần hợp lý và được trao đổi trước sẽ giúp nhóm có trải nghiệm thoải mái hơn."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Tham khảo các nhóm món trong mục Nhà hàng.\nBáo trước số người, món cần tránh và nhu cầu của trẻ nhỏ.\nTrao đổi thời gian dùng bữa để sắp xếp lịch đi chơi phù hợp."},{"type":"image","src":"assets/images/restaurant/food-collage.png","text":"Thêm thời gian quây quần vào lịch nghỉ"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Bạn có thể xem món trên website rồi liên hệ để hỏi khẩu phần, giá và khả năng phục vụ vào ngày dự kiến. Việc tư vấn giúp thống nhất lựa chọn trước khi xác nhận bữa ăn."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Sau một ngày di chuyển, bữa ăn chung là lúc mọi người cùng ngồi lại và kể chuyện. Một thực đơn vừa khẩu vị, chia phần hợp lý và được trao đổi trước sẽ giúp nhóm có trải nghiệm thoải mái hơn.

Gợi ý cho chuyến đi

Tham khảo các nhóm món trong mục Nhà hàng.
Báo trước số người, món cần tránh và nhu cầu của trẻ nhỏ.
Trao đổi thời gian dùng bữa để sắp xếp lịch đi chơi phù hợp.

Chuẩn bị theo cách của bạn

Bạn có thể xem món trên website rồi liên hệ để hỏi khẩu phần, giá và khả năng phục vụ vào ngày dự kiến. Việc tư vấn giúp thống nhất lựa chọn trước khi xác nhận bữa ăn.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/restaurant/food-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = '90s-4' AND ("title" = '[Bài mẫu] Một bữa ăn cùng nhau' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Khoảnh khắc giữa thiên nhiên' THEN 'Khoảnh khắc giữa thiên nhiên' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Một chuyến đi có chỗ cho những điều giản dị' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Một buổi sáng nhiều mây, tiếng gió ngoài hiên hay cuộc trò chuyện chậm rãi đều có thể trở thành kỷ niệm. Bạn không cần chuẩn bị một chuyến đi cầu kỳ để tìm thấy những khoảnh khắc ấy.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Một buổi sáng nhiều mây, tiếng gió ngoài hiên hay cuộc trò chuyện chậm rãi đều có thể trở thành kỷ niệm. Bạn không cần chuẩn bị một chuyến đi cầu kỳ để tìm thấy những khoảnh khắc ấy."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Chuẩn bị giày dễ đi và một chiếc áo phù hợp thời tiết.\nMang chai nước cá nhân và giữ vệ sinh không gian chung.\nƯu tiên đường đi an toàn; không vượt rào chỉ để chụp ảnh."},{"type":"image","src":"assets/images/hero/hero-01.png","text":"Một chuyến đi có chỗ cho những điều giản dị"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Hãy chọn một hạng phòng phù hợp và để lịch trình có khoảng trống. Khi bớt vội, bạn sẽ có thêm cơ hội nhận ra những điều thú vị xung quanh."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Một buổi sáng nhiều mây, tiếng gió ngoài hiên hay cuộc trò chuyện chậm rãi đều có thể trở thành kỷ niệm. Bạn không cần chuẩn bị một chuyến đi cầu kỳ để tìm thấy những khoảnh khắc ấy.

Gợi ý cho chuyến đi

Chuẩn bị giày dễ đi và một chiếc áo phù hợp thời tiết.
Mang chai nước cá nhân và giữ vệ sinh không gian chung.
Ưu tiên đường đi an toàn; không vượt rào chỉ để chụp ảnh.

Chuẩn bị theo cách của bạn

Hãy chọn một hạng phòng phù hợp và để lịch trình có khoảng trống. Khi bớt vội, bạn sẽ có thêm cơ hội nhận ra những điều thú vị xung quanh.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/hero/hero-01.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = '90s-5' AND ("title" = '[Bài mẫu] Khoảnh khắc giữa thiên nhiên' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Chuyện của một kỳ nghỉ' THEN 'Chuyện của một kỳ nghỉ' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Chuẩn bị ít hơn nhưng đúng những điều cần thiết' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Một kỳ nghỉ dễ chịu thường bắt đầu từ vài thông tin rõ ràng: đi cùng ai, cần bao nhiêu chỗ ngủ và muốn dành thời gian cho điều gì. Thống nhất những điểm này sẽ giúp cả nhóm lựa chọn nhanh hơn.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Một kỳ nghỉ dễ chịu thường bắt đầu từ vài thông tin rõ ràng: đi cùng ai, cần bao nhiêu chỗ ngủ và muốn dành thời gian cho điều gì. Thống nhất những điểm này sẽ giúp cả nhóm lựa chọn nhanh hơn."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Ghi lại số người và nhu cầu giường của từng nhóm nhỏ.\nChọn ngày đến, ngày về dự kiến rồi gửi cùng yêu cầu tư vấn.\nDành ngân sách riêng cho đi lại, ăn uống và hoạt động phát sinh."},{"type":"image","src":"assets/images/rooms/rooms-collage.png","text":"Chuẩn bị ít hơn nhưng đúng những điều cần thiết"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Các mức giá trên trang phòng là thông tin tham khảo. Hãy trao đổi trực tiếp để kiểm tra phương án lưu trú cho lịch trình của bạn trước khi chốt chuyến đi."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Một kỳ nghỉ dễ chịu thường bắt đầu từ vài thông tin rõ ràng: đi cùng ai, cần bao nhiêu chỗ ngủ và muốn dành thời gian cho điều gì. Thống nhất những điểm này sẽ giúp cả nhóm lựa chọn nhanh hơn.

Gợi ý cho chuyến đi

Ghi lại số người và nhu cầu giường của từng nhóm nhỏ.
Chọn ngày đến, ngày về dự kiến rồi gửi cùng yêu cầu tư vấn.
Dành ngân sách riêng cho đi lại, ăn uống và hoạt động phát sinh.

Chuẩn bị theo cách của bạn

Các mức giá trên trang phòng là thông tin tham khảo. Hãy trao đổi trực tiếp để kiểm tra phương án lưu trú cho lịch trình của bạn trước khi chốt chuyến đi.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/rooms/rooms-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = '90s-6' AND ("title" = '[Bài mẫu] Chuyện của một kỳ nghỉ' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Một hành trình mới' THEN 'Một hành trình mới' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Gợi ý chuẩn bị cho lần đầu ghé 90s' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Nếu đây là lần đầu tìm hiểu 90s, bạn có thể bắt đầu từ ảnh phòng, không gian ăn uống và những câu chuyện trên website. Mỗi mục giúp bạn hình dung một phần của chuyến đi thay vì phải quyết định ngay.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Nếu đây là lần đầu tìm hiểu 90s, bạn có thể bắt đầu từ ảnh phòng, không gian ăn uống và những câu chuyện trên website. Mỗi mục giúp bạn hình dung một phần của chuyến đi thay vì phải quyết định ngay."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Xem trang chi tiết phòng để đối chiếu sức chứa và hướng nhìn.\nLưu lại đường dẫn bài viết hoặc hạng phòng muốn hỏi thêm.\nDùng kênh liên hệ chính thức trong mục Liên hệ để nhận tư vấn."},{"type":"image","src":"assets/images/cafe/cafe-collage.png","text":"Gợi ý chuẩn bị cho lần đầu ghé 90s"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Hãy chia sẻ nhu cầu của nhóm, kể cả những điều nhỏ như bữa ăn hay giờ di chuyển dự kiến. Những thông tin cụ thể giúp việc chuẩn bị phù hợp và tiết kiệm thời gian hơn."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Nếu đây là lần đầu tìm hiểu 90s, bạn có thể bắt đầu từ ảnh phòng, không gian ăn uống và những câu chuyện trên website. Mỗi mục giúp bạn hình dung một phần của chuyến đi thay vì phải quyết định ngay.

Gợi ý cho chuyến đi

Xem trang chi tiết phòng để đối chiếu sức chứa và hướng nhìn.
Lưu lại đường dẫn bài viết hoặc hạng phòng muốn hỏi thêm.
Dùng kênh liên hệ chính thức trong mục Liên hệ để nhận tư vấn.

Chuẩn bị theo cách của bạn

Hãy chia sẻ nhu cầu của nhóm, kể cả những điều nhỏ như bữa ăn hay giờ di chuyển dự kiến. Những thông tin cụ thể giúp việc chuẩn bị phù hợp và tiết kiệm thời gian hơn.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/cafe/cafe-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = '90s-7' AND ("title" = '[Bài mẫu] Một hành trình mới' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Hẹn nhau trong chuyến đi tiếp theo' THEN 'Hẹn nhau trong chuyến đi tiếp theo' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Lưu lại những điều muốn trải nghiệm cùng nhau' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Sau một chuyến đi, đôi khi điều đáng nhớ nhất là một bữa ăn hay câu chuyện chưa kể hết. Bạn có thể bắt đầu kế hoạch tiếp theo bằng việc ghi lại những trải nghiệm cả nhóm muốn dành thêm thời gian.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Sau một chuyến đi, đôi khi điều đáng nhớ nhất là một bữa ăn hay câu chuyện chưa kể hết. Bạn có thể bắt đầu kế hoạch tiếp theo bằng việc ghi lại những trải nghiệm cả nhóm muốn dành thêm thời gian."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Chọn thời điểm phù hợp với lịch chung của mọi người.\nXem lại hạng phòng và số khách nếu nhóm có thay đổi.\nChia sẻ nhu cầu sớm để có thời gian trao đổi phương án."},{"type":"image","src":"assets/images/restaurant/food-collage.png","text":"Lưu lại những điều muốn trải nghiệm cùng nhau"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Website luôn có chỗ để bạn tham khảo phòng, nội dung trải nghiệm và các bài viết mới. Khi sẵn sàng cho chuyến đi, hãy liên hệ để cùng lên một kế hoạch vừa sức."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Sau một chuyến đi, đôi khi điều đáng nhớ nhất là một bữa ăn hay câu chuyện chưa kể hết. Bạn có thể bắt đầu kế hoạch tiếp theo bằng việc ghi lại những trải nghiệm cả nhóm muốn dành thêm thời gian.

Gợi ý cho chuyến đi

Chọn thời điểm phù hợp với lịch chung của mọi người.
Xem lại hạng phòng và số khách nếu nhóm có thay đổi.
Chia sẻ nhu cầu sớm để có thời gian trao đổi phương án.

Chuẩn bị theo cách của bạn

Website luôn có chỗ để bạn tham khảo phòng, nội dung trải nghiệm và các bài viết mới. Khi sẵn sàng cho chuyến đi, hãy liên hệ để cùng lên một kế hoạch vừa sức.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/restaurant/food-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = '90s-8' AND ("title" = '[Bài mẫu] Hẹn nhau trong chuyến đi tiếp theo' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về 90s. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Một điểm hẹn giữa núi' THEN 'Tam Đảo: một khoảng nghỉ giữa núi' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Bắt đầu khám phá bằng một lịch trình vừa đủ' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Tam Đảo phù hợp với những chuyến đi muốn đổi không khí và tận hưởng nhịp sống chậm hơn. Bạn có thể kết hợp đi dạo trong thị trấn, thưởng thức bữa ăn và dành thời gian nghỉ tại nơi lưu trú.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Tam Đảo phù hợp với những chuyến đi muốn đổi không khí và tận hưởng nhịp sống chậm hơn. Bạn có thể kết hợp đi dạo trong thị trấn, thưởng thức bữa ăn và dành thời gian nghỉ tại nơi lưu trú."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Theo dõi dự báo thời tiết sát ngày khởi hành.\nSắp xếp thời gian di chuyển để không phải vội khi đến nơi.\nChọn ít điểm ghé nhưng dành đủ thời gian cho từng nơi."},{"type":"image","src":"assets/images/hero/hero-01.png","text":"Bắt đầu khám phá bằng một lịch trình vừa đủ"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Một nơi nghỉ hợp nhu cầu sẽ giúp bạn có chỗ trở về giữa các hoạt động. Tham khảo hạng phòng và trao đổi lịch trình dự kiến để chủ động chuẩn bị."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Tam Đảo phù hợp với những chuyến đi muốn đổi không khí và tận hưởng nhịp sống chậm hơn. Bạn có thể kết hợp đi dạo trong thị trấn, thưởng thức bữa ăn và dành thời gian nghỉ tại nơi lưu trú.

Gợi ý cho chuyến đi

Theo dõi dự báo thời tiết sát ngày khởi hành.
Sắp xếp thời gian di chuyển để không phải vội khi đến nơi.
Chọn ít điểm ghé nhưng dành đủ thời gian cho từng nơi.

Chuẩn bị theo cách của bạn

Một nơi nghỉ hợp nhu cầu sẽ giúp bạn có chỗ trở về giữa các hoạt động. Tham khảo hạng phòng và trao đổi lịch trình dự kiến để chủ động chuẩn bị.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/hero/hero-01.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = 'tam-dao-1' AND ("title" = '[Bài mẫu] Một điểm hẹn giữa núi' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Gợi ý cho một ngày thong thả' THEN 'Một ngày thong thả ở Tam Đảo' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Cân bằng khám phá và thời gian nghỉ' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Bạn có thể dành buổi sáng cho một vòng đi dạo, buổi chiều tìm góc ngồi yên tĩnh và buổi tối dùng bữa cùng người thân. Điều quan trọng là giữ lịch trình linh hoạt khi thời tiết thay đổi.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Bạn có thể dành buổi sáng cho một vòng đi dạo, buổi chiều tìm góc ngồi yên tĩnh và buổi tối dùng bữa cùng người thân. Điều quan trọng là giữ lịch trình linh hoạt khi thời tiết thay đổi."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Đọc trước đường đi và cân nhắc sức khỏe của cả nhóm.\nChuẩn bị phương án nghỉ trong nhà nếu có mưa.\nKhông xếp các hoạt động ở xa nhau quá sát giờ."},{"type":"image","src":"assets/images/rooms/rooms-collage.png","text":"Cân bằng khám phá và thời gian nghỉ"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Không cần đi hết mọi địa điểm trong một lần ghé. Một ngày có nhịp nghỉ hợp lý giúp bạn tận hưởng cảnh quan và trở về với cảm giác nhẹ nhàng hơn."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Bạn có thể dành buổi sáng cho một vòng đi dạo, buổi chiều tìm góc ngồi yên tĩnh và buổi tối dùng bữa cùng người thân. Điều quan trọng là giữ lịch trình linh hoạt khi thời tiết thay đổi.

Gợi ý cho chuyến đi

Đọc trước đường đi và cân nhắc sức khỏe của cả nhóm.
Chuẩn bị phương án nghỉ trong nhà nếu có mưa.
Không xếp các hoạt động ở xa nhau quá sát giờ.

Chuẩn bị theo cách của bạn

Không cần đi hết mọi địa điểm trong một lần ghé. Một ngày có nhịp nghỉ hợp lý giúp bạn tận hưởng cảnh quan và trở về với cảm giác nhẹ nhàng hơn.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/rooms/rooms-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = 'tam-dao-2' AND ("title" = '[Bài mẫu] Gợi ý cho một ngày thong thả' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Những góc nhìn trong chuyến đi' THEN 'Những góc nhìn đáng lưu lại' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Chụp ảnh và tận hưởng cảnh quan một cách thoải mái' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Khung cảnh vùng núi thay đổi theo mây, ánh sáng và thời tiết. Có lúc một con đường quen cũng trở nên khác lạ, vì vậy hãy dành thời gian quan sát thay vì chỉ tìm một góc ảnh cố định.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Khung cảnh vùng núi thay đổi theo mây, ánh sáng và thời tiết. Có lúc một con đường quen cũng trở nên khác lạ, vì vậy hãy dành thời gian quan sát thay vì chỉ tìm một góc ảnh cố định."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Giữ thiết bị gọn nhẹ và chú ý bề mặt trơn khi trời ẩm.\nTôn trọng biển báo, khu vực riêng tư và người xung quanh.\nChọn góc an toàn; không đứng sát mép dốc để chụp ảnh."},{"type":"image","src":"assets/images/cafe/cafe-collage.png","text":"Chụp ảnh và tận hưởng cảnh quan một cách thoải mái"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Bạn có thể lưu những bức ảnh mình thích rồi tiếp tục chuyến đi mà không cần chạy theo quá nhiều điểm. Trải nghiệm thực tế luôn đáng dành thời gian hơn một lịch chụp kín."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Khung cảnh vùng núi thay đổi theo mây, ánh sáng và thời tiết. Có lúc một con đường quen cũng trở nên khác lạ, vì vậy hãy dành thời gian quan sát thay vì chỉ tìm một góc ảnh cố định.

Gợi ý cho chuyến đi

Giữ thiết bị gọn nhẹ và chú ý bề mặt trơn khi trời ẩm.
Tôn trọng biển báo, khu vực riêng tư và người xung quanh.
Chọn góc an toàn; không đứng sát mép dốc để chụp ảnh.

Chuẩn bị theo cách của bạn

Bạn có thể lưu những bức ảnh mình thích rồi tiếp tục chuyến đi mà không cần chạy theo quá nhiều điểm. Trải nghiệm thực tế luôn đáng dành thời gian hơn một lịch chụp kín.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/cafe/cafe-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = 'tam-dao-3' AND ("title" = '[Bài mẫu] Những góc nhìn trong chuyến đi' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Một bữa ăn cùng nhau' THEN 'Ăn gì trong chuyến đi Tam Đảo?' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Bắt đầu từ khẩu vị và số người trong nhóm' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Lựa chọn bữa ăn sẽ dễ hơn khi cả nhóm thống nhất thích món nóng, món rau hay một bữa cơm dùng chung. Một thực đơn cân bằng cũng giúp chuyến đi thoải mái sau những quãng di chuyển.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Lựa chọn bữa ăn sẽ dễ hơn khi cả nhóm thống nhất thích món nóng, món rau hay một bữa cơm dùng chung. Một thực đơn cân bằng cũng giúp chuyến đi thoải mái sau những quãng di chuyển."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Hỏi rõ khẩu phần, giá và món có thể chuẩn bị vào ngày đi.\nThông báo dị ứng hoặc chế độ ăn riêng khi liên hệ.\nThống nhất giờ ăn để tránh ảnh hưởng lịch nghỉ của nhóm."},{"type":"image","src":"assets/images/restaurant/food-collage.png","text":"Bắt đầu từ khẩu vị và số người trong nhóm"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Mục Nhà hàng giới thiệu các nhóm món để bạn tham khảo. Hãy gửi lựa chọn cùng số khách dự kiến để nhận tư vấn phù hợp thay vì chỉ dựa vào hình ảnh."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Lựa chọn bữa ăn sẽ dễ hơn khi cả nhóm thống nhất thích món nóng, món rau hay một bữa cơm dùng chung. Một thực đơn cân bằng cũng giúp chuyến đi thoải mái sau những quãng di chuyển.

Gợi ý cho chuyến đi

Hỏi rõ khẩu phần, giá và món có thể chuẩn bị vào ngày đi.
Thông báo dị ứng hoặc chế độ ăn riêng khi liên hệ.
Thống nhất giờ ăn để tránh ảnh hưởng lịch nghỉ của nhóm.

Chuẩn bị theo cách của bạn

Mục Nhà hàng giới thiệu các nhóm món để bạn tham khảo. Hãy gửi lựa chọn cùng số khách dự kiến để nhận tư vấn phù hợp thay vì chỉ dựa vào hình ảnh.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/restaurant/food-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = 'tam-dao-4' AND ("title" = '[Bài mẫu] Một bữa ăn cùng nhau' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Khoảnh khắc giữa thiên nhiên' THEN 'Chuẩn bị cho thời tiết vùng núi' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Những vật dụng nhỏ giúp chuyến đi dễ chịu hơn' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Thời tiết có thể ảnh hưởng đến kế hoạch đi dạo, trang phục và việc di chuyển. Chuẩn bị linh hoạt sẽ giúp bạn bớt bị động mà không phải mang quá nhiều đồ.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Thời tiết có thể ảnh hưởng đến kế hoạch đi dạo, trang phục và việc di chuyển. Chuẩn bị linh hoạt sẽ giúp bạn bớt bị động mà không phải mang quá nhiều đồ."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Mang áo khoác nhẹ, giày đế bám và đồ che mưa gọn.\nBảo quản thiết bị điện tử trong túi phù hợp khi trời ẩm.\nTheo dõi dự báo và ưu tiên nghỉ ngơi nếu điều kiện không thuận lợi."},{"type":"image","src":"assets/images/hero/hero-01.png","text":"Những vật dụng nhỏ giúp chuyến đi dễ chịu hơn"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Nếu đi cùng trẻ nhỏ hoặc người lớn tuổi, hãy dành thêm thời gian chuyển tiếp giữa các hoạt động. Một lịch trình có khoảng nghỉ luôn dễ điều chỉnh hơn."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Thời tiết có thể ảnh hưởng đến kế hoạch đi dạo, trang phục và việc di chuyển. Chuẩn bị linh hoạt sẽ giúp bạn bớt bị động mà không phải mang quá nhiều đồ.

Gợi ý cho chuyến đi

Mang áo khoác nhẹ, giày đế bám và đồ che mưa gọn.
Bảo quản thiết bị điện tử trong túi phù hợp khi trời ẩm.
Theo dõi dự báo và ưu tiên nghỉ ngơi nếu điều kiện không thuận lợi.

Chuẩn bị theo cách của bạn

Nếu đi cùng trẻ nhỏ hoặc người lớn tuổi, hãy dành thêm thời gian chuyển tiếp giữa các hoạt động. Một lịch trình có khoảng nghỉ luôn dễ điều chỉnh hơn.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/hero/hero-01.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = 'tam-dao-5' AND ("title" = '[Bài mẫu] Khoảnh khắc giữa thiên nhiên' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Chuyện của một kỳ nghỉ' THEN 'Lên lịch nghỉ cùng gia đình' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Để mỗi thành viên đều có khoảng thời gian dễ chịu' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Đi cùng gia đình thường có nhiều nhu cầu khác nhau về giấc ngủ, bữa ăn và tốc độ di chuyển. Bạn có thể bắt đầu từ việc chọn phòng đủ sức chứa rồi mới ghép các hoạt động xung quanh.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Đi cùng gia đình thường có nhiều nhu cầu khác nhau về giấc ngủ, bữa ăn và tốc độ di chuyển. Bạn có thể bắt đầu từ việc chọn phòng đủ sức chứa rồi mới ghép các hoạt động xung quanh."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Kiểm tra số giường và trao đổi nhu cầu riêng trước khi chọn phòng.\nChừa thời gian nghỉ giữa các điểm đi dạo.\nMang theo vật dụng cá nhân cần thiết và thuốc đang sử dụng."},{"type":"image","src":"assets/images/rooms/rooms-collage.png","text":"Để mỗi thành viên đều có khoảng thời gian dễ chịu"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Chia sẻ số người, độ tuổi và lịch trình dự kiến khi nhận tư vấn. Những thông tin này giúp lựa chọn lưu trú và bữa ăn gần với nhu cầu thực tế hơn."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Đi cùng gia đình thường có nhiều nhu cầu khác nhau về giấc ngủ, bữa ăn và tốc độ di chuyển. Bạn có thể bắt đầu từ việc chọn phòng đủ sức chứa rồi mới ghép các hoạt động xung quanh.

Gợi ý cho chuyến đi

Kiểm tra số giường và trao đổi nhu cầu riêng trước khi chọn phòng.
Chừa thời gian nghỉ giữa các điểm đi dạo.
Mang theo vật dụng cá nhân cần thiết và thuốc đang sử dụng.

Chuẩn bị theo cách của bạn

Chia sẻ số người, độ tuổi và lịch trình dự kiến khi nhận tư vấn. Những thông tin này giúp lựa chọn lưu trú và bữa ăn gần với nhu cầu thực tế hơn.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/rooms/rooms-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = 'tam-dao-6' AND ("title" = '[Bài mẫu] Chuyện của một kỳ nghỉ' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Một hành trình mới' THEN 'Một hành trình dành cho nhóm bạn' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Thống nhất kế hoạch trước khi cùng khởi hành' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Chuyến đi nhóm vui hơn khi mọi người cùng hiểu ngân sách, lịch di chuyển và cách chia phòng. Một cuộc trao đổi ngắn trước ngày đi có thể tránh được nhiều thay đổi vào phút cuối.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Chuyến đi nhóm vui hơn khi mọi người cùng hiểu ngân sách, lịch di chuyển và cách chia phòng. Một cuộc trao đổi ngắn trước ngày đi có thể tránh được nhiều thay đổi vào phút cuối."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Cử một người tổng hợp số khách và nhu cầu của cả nhóm.\nLưu chung thông tin đường đi, nơi nghỉ và các khoản đã thống nhất.\nĐể lịch trình có hoạt động tự chọn cho những sở thích khác nhau."},{"type":"image","src":"assets/images/cafe/cafe-collage.png","text":"Thống nhất kế hoạch trước khi cùng khởi hành"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Nếu cần nhiều phòng, hãy gửi yêu cầu cùng thời gian dự kiến để trao đổi phương án. Không nên suy ra số phòng trống chỉ từ tổng số phòng được giới thiệu trên website."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Chuyến đi nhóm vui hơn khi mọi người cùng hiểu ngân sách, lịch di chuyển và cách chia phòng. Một cuộc trao đổi ngắn trước ngày đi có thể tránh được nhiều thay đổi vào phút cuối.

Gợi ý cho chuyến đi

Cử một người tổng hợp số khách và nhu cầu của cả nhóm.
Lưu chung thông tin đường đi, nơi nghỉ và các khoản đã thống nhất.
Để lịch trình có hoạt động tự chọn cho những sở thích khác nhau.

Chuẩn bị theo cách của bạn

Nếu cần nhiều phòng, hãy gửi yêu cầu cùng thời gian dự kiến để trao đổi phương án. Không nên suy ra số phòng trống chỉ từ tổng số phòng được giới thiệu trên website.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/cafe/cafe-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = 'tam-dao-7' AND ("title" = '[Bài mẫu] Một hành trình mới' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "News" SET
 "title" = CASE WHEN "title" = '[Bài mẫu] Hẹn nhau trong chuyến đi tiếp theo' THEN 'Những điều muốn giữ lại sau chuyến đi' ELSE "title" END,
 "subtitle" = CASE WHEN "subtitle" = '' THEN 'Một chút chuẩn bị cho lần trở lại' ELSE "subtitle" END,
 "excerpt" = CASE WHEN "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' THEN 'Kết thúc chuyến đi là lúc bạn có thể ghi lại nơi đã thích, món muốn thử thêm và những điều nên chuẩn bị khác đi. Danh sách ngắn ấy sẽ hữu ích cho lần trở lại cùng gia đình hoặc bạn bè.' ELSE "excerpt" END,
 "contentDoc" = CASE WHEN "contentDoc" = '[]'::jsonb AND ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN '[{"type":"paragraph","text":"Kết thúc chuyến đi là lúc bạn có thể ghi lại nơi đã thích, món muốn thử thêm và những điều nên chuẩn bị khác đi. Danh sách ngắn ấy sẽ hữu ích cho lần trở lại cùng gia đình hoặc bạn bè."},{"type":"heading","text":"Gợi ý cho chuyến đi"},{"type":"list","text":"Lưu ảnh và đường dẫn hữu ích vào một thư mục chung.\nGhi chú thời gian di chuyển thực tế và các nhu cầu của nhóm.\nDọn sạch không gian đã sử dụng và kiểm tra đồ cá nhân trước khi về."},{"type":"image","src":"assets/images/restaurant/food-collage.png","text":"Một chút chuẩn bị cho lần trở lại"},{"type":"heading","text":"Chuẩn bị theo cách của bạn"},{"type":"paragraph","text":"Mỗi chuyến đi có thể mang một nhịp khác nhau. Hãy giữ lại điều khiến bạn thấy thoải mái, rồi dùng nó làm điểm bắt đầu cho kế hoạch tiếp theo."},{"type":"paragraph","text":"Xem phòng đôi view núi và thông tin lưu trú tại 90s","href":"/phong/double"}]'::jsonb ELSE "contentDoc" END,
 "content" = CASE WHEN ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.') THEN 'Kết thúc chuyến đi là lúc bạn có thể ghi lại nơi đã thích, món muốn thử thêm và những điều nên chuẩn bị khác đi. Danh sách ngắn ấy sẽ hữu ích cho lần trở lại cùng gia đình hoặc bạn bè.

Gợi ý cho chuyến đi

Lưu ảnh và đường dẫn hữu ích vào một thư mục chung.
Ghi chú thời gian di chuyển thực tế và các nhu cầu của nhóm.
Dọn sạch không gian đã sử dụng và kiểm tra đồ cá nhân trước khi về.

Chuẩn bị theo cách của bạn

Mỗi chuyến đi có thể mang một nhịp khác nhau. Hãy giữ lại điều khiến bạn thấy thoải mái, rồi dùng nó làm điểm bắt đầu cho kế hoạch tiếp theo.

Xem phòng đôi view núi và thông tin lưu trú tại 90s' ELSE "content" END,
 "imageUrl" = CASE WHEN "imageUrl" = '' OR "imageUrl" = 'assets/images/news/news-placeholder-01.png' THEN 'assets/images/restaurant/food-collage.png' ELSE "imageUrl" END,
 "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = 'tam-dao-8' AND ("title" = '[Bài mẫu] Hẹn nhau trong chuyến đi tiếp theo' OR "subtitle" = '' OR "excerpt" = '' OR "excerpt" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.' OR ("content" = '' OR "content" = 'Nội dung minh họa cho chuyên mục Về Tam Đảo. Bài viết chính thức sẽ được bổ sung sau khi duyệt.'));

UPDATE "Room" SET "subtitle" = '1 giường đôi · Không gian nghỉ ngơi tại Tam Đảo', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'double' AND "subtitle" = '';

UPDATE "Room" SET "subtitle" = '1 giường đôi · Không gian nghỉ ngơi tại Tam Đảo', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'bungalow' AND "subtitle" = '';

UPDATE "Room" SET "subtitle" = '2 giường đôi · Không gian nghỉ ngơi tại Tam Đảo', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'family' AND "subtitle" = '';

UPDATE "Room" SET "subtitle" = '3 giường đôi · Không gian nghỉ ngơi tại Tam Đảo', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'group' AND "subtitle" = '';

UPDATE "ContentCard" SET "subtitle" = 'Một bữa ăn ấm cúng sau ngày dài khám phá.', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'hotpot' AND ("subtitle" = '');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/restaurant/food-collage.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'hotpot' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Khám phá món', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'hotpot' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#nha-hang', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'hotpot' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'Thơm ngon khó cưỡng', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'grill' AND ("subtitle" = '');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/restaurant/food-collage.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'grill' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Khám phá món', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'grill' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#nha-hang', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'grill' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'Hương vị thân quen', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'meal' AND ("subtitle" = '');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/restaurant/food-collage.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'meal' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Khám phá món', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'meal' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#nha-hang', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'meal' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'Tươi ngon từ cao nguyên', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'greens' AND ("subtitle" = '');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/restaurant/food-collage.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'greens' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Khám phá món', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'greens' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#nha-hang', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'greens' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'Một góc thư giãn giữa núi', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-0' AND ("subtitle" = '');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/cafe/cafe-collage.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-0' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Khám phá không gian', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-0' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#ca-phe', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-0' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'Cùng bạn bè chuyện trò', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-1' AND ("subtitle" = '');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/cafe/cafe-collage.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-1' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Khám phá không gian', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-1' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#ca-phe', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-1' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'Dừng chân với ly đồ uống yêu thích', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-2' AND ("subtitle" = '');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/cafe/cafe-collage.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-2' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Khám phá không gian', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-2' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#ca-phe', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'cafe-2' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'Dành thêm thời gian nghỉ ngơi, ăn ngon và khám phá Tam Đảo.', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'weekday-offer' AND ("subtitle" = '' OR "subtitle" = 'Chương trình minh họa; điều kiện và quyền lợi chưa được áp dụng chính thức.');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/hero/hero-01.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'weekday-offer' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Tư vấn gói nghỉ & ăn', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'weekday-offer' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#lien-he', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'weekday-offer' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'Dành thêm thời gian nghỉ ngơi, ăn ngon và khám phá Tam Đảo.', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'group-offer' AND ("subtitle" = '' OR "subtitle" = 'Chương trình minh họa; điều kiện và quyền lợi chưa được áp dụng chính thức.');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/rooms/rooms-collage.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'group-offer' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Tư vấn cho nhóm', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'group-offer' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '#lien-he', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'group-offer' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "subtitle" = 'VỀ 90s HOMESTAY', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'about-90s' AND ("subtitle" = '');

UPDATE "ContentCard" SET "imageUrl" = 'assets/images/misc/logo.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'about-90s' AND ("imageUrl" = '');

UPDATE "ContentCard" SET "ctaText" = 'Xem hạng phòng', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'about-90s' AND ("ctaText" = '');

UPDATE "ContentCard" SET "ctaTarget" = '/phong/double', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'about-90s' AND ("ctaTarget" = '');

UPDATE "ContentCard" SET "description" = 'Nghỉ giữa thiên nhiên, quây quần bên bữa ngon và dành thời gian cho nhau. 90s mang đến trải nghiệm lưu trú, nhà hàng và không gian cà phê để ngắm cảnh và trò chuyện.', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'about-90s' AND "description" = 'Nghỉ giữa thiên nhiên, quây quần bên bữa ngon và dành thời gian cho nhau. 90s mang đến trải nghiệm lưu trú, nhà hàng và một không gian cà phê mới đang được chuẩn bị.';

UPDATE "SiteConfig" SET "value" = '' WHERE "key" = 'businessNotice' AND "value" IN ('Nội dung mẫu chưa được chủ website xác nhận.', 'Nội dung mẫu / chưa được chủ website xác nhận.');

UPDATE "SiteConfig" SET "value" = 'Cà phê tại 90s' WHERE "key" = 'cafeStatus' AND "value" = 'Thông tin khu cà phê đang chờ xác nhận';

UPDATE "SiteConfig" SET "value" = '90s Homestay — lưu trú, nhà hàng và cà phê tại Tam Đảo. Khám phá phòng nghỉ, không gian và những gợi ý cho chuyến đi.' WHERE "key" = 'siteDescription' AND "value" = '90s Homestay — lưu trú, nhà hàng và cà phê tại Tam Đảo. Bản mẫu giao diện.';
