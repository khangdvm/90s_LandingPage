// Nội dung khởi tạo có thể biên tập trong CMS; không chứa giá hay cam kết đặt chỗ.
const articles = [
  [
    "90s-1",
    "Một điểm hẹn giữa núi",
    "Dành một khoảng nghỉ cho mình ở Tam Đảo",
    "Đôi khi một chuyến đi không cần lịch trình dày đặc. Chỉ cần rời nhịp phố, tìm một căn phòng hợp với số người và dành buổi chiều để ngắm mây, bạn đã có một khởi đầu dễ chịu ở Tam Đảo.",
    [
      "Chọn hướng nhìn và sức chứa trước khi chọn hạng phòng.",
      "Mang theo áo khoác nhẹ để dùng khi trời chuyển lạnh.",
      "Chừa thời gian cho một bữa ăn chung thay vì di chuyển liên tục.",
    ],
    "Hãy xem các hạng phòng tại 90s, ghi lại ngày đi và trao đổi với đội ngũ tư vấn để chọn không gian phù hợp. Một kế hoạch vừa đủ sẽ để lại nhiều thời gian hơn cho những người đi cùng.",
  ],
  [
    "90s-2",
    "Gợi ý cho một ngày thong thả",
    "Một lịch trình nhẹ nhàng từ sáng đến tối",
    "Bắt đầu ngày mới bằng bữa sáng, một ly đồ uống yêu thích và khoảng thời gian nhìn ra ngoài cửa sổ. Thay vì cố ghé thật nhiều nơi, bạn có thể chọn một điểm đi dạo rồi dành phần còn lại trong ngày cho nghỉ ngơi.",
    [
      "Buổi sáng: ăn sáng và kiểm tra thời tiết trước khi ra ngoài.",
      "Buổi chiều: chọn một góc ngồi, đọc sách hoặc trò chuyện.",
      "Buổi tối: quây quần bên bữa ăn, chuẩn bị lịch trình ngày sau.",
    ],
    "Lịch trình này là gợi ý linh hoạt. Hãy điều chỉnh theo thời tiết, sức khỏe và sở thích của nhóm; thông báo trước nhu cầu ăn uống để chuyến đi thuận tiện hơn.",
  ],
  [
    "90s-3",
    "Những góc nhìn trong chuyến đi",
    "Chọn khung cảnh hợp với cách bạn nghỉ ngơi",
    "Có người thích nhìn về thung lũng, có người lại muốn cảm nhận nhịp sống của thị trấn. Hướng nhìn của căn phòng là một phần nhỏ nhưng có thể tạo nên cảm giác rất riêng cho kỳ nghỉ.",
    [
      "Xem ảnh phòng và đọc mô tả giường, số khách trước khi chọn.",
      "Chụp ảnh vào lúc ánh sáng mềm và tránh chắn lối đi chung.",
      "Giữ một vài khoảng thời gian không dùng điện thoại để tận hưởng khung cảnh.",
    ],
    "Ảnh và thông tin từng hạng phòng được giới thiệu trong mục Phòng nghỉ. Nếu có nhu cầu cụ thể về vị trí hoặc cách bố trí, hãy trao đổi khi nhận tư vấn.",
  ],
  [
    "90s-4",
    "Một bữa ăn cùng nhau",
    "Thêm thời gian quây quần vào lịch nghỉ",
    "Sau một ngày di chuyển, bữa ăn chung là lúc mọi người cùng ngồi lại và kể chuyện. Một thực đơn vừa khẩu vị, chia phần hợp lý và được trao đổi trước sẽ giúp nhóm có trải nghiệm thoải mái hơn.",
    [
      "Tham khảo các nhóm món trong mục Nhà hàng.",
      "Báo trước số người, món cần tránh và nhu cầu của trẻ nhỏ.",
      "Trao đổi thời gian dùng bữa để sắp xếp lịch đi chơi phù hợp.",
    ],
    "Bạn có thể xem món trên website rồi liên hệ để hỏi khẩu phần, giá và khả năng phục vụ vào ngày dự kiến. Việc tư vấn giúp thống nhất lựa chọn trước khi xác nhận bữa ăn.",
  ],
  [
    "90s-5",
    "Khoảnh khắc giữa thiên nhiên",
    "Một chuyến đi có chỗ cho những điều giản dị",
    "Một buổi sáng nhiều mây, tiếng gió ngoài hiên hay cuộc trò chuyện chậm rãi đều có thể trở thành kỷ niệm. Bạn không cần chuẩn bị một chuyến đi cầu kỳ để tìm thấy những khoảnh khắc ấy.",
    [
      "Chuẩn bị giày dễ đi và một chiếc áo phù hợp thời tiết.",
      "Mang chai nước cá nhân và giữ vệ sinh không gian chung.",
      "Ưu tiên đường đi an toàn; không vượt rào chỉ để chụp ảnh.",
    ],
    "Hãy chọn một hạng phòng phù hợp và để lịch trình có khoảng trống. Khi bớt vội, bạn sẽ có thêm cơ hội nhận ra những điều thú vị xung quanh.",
  ],
  [
    "90s-6",
    "Chuyện của một kỳ nghỉ",
    "Chuẩn bị ít hơn nhưng đúng những điều cần thiết",
    "Một kỳ nghỉ dễ chịu thường bắt đầu từ vài thông tin rõ ràng: đi cùng ai, cần bao nhiêu chỗ ngủ và muốn dành thời gian cho điều gì. Thống nhất những điểm này sẽ giúp cả nhóm lựa chọn nhanh hơn.",
    [
      "Ghi lại số người và nhu cầu giường của từng nhóm nhỏ.",
      "Chọn ngày đến, ngày về dự kiến rồi gửi cùng yêu cầu tư vấn.",
      "Dành ngân sách riêng cho đi lại, ăn uống và hoạt động phát sinh.",
    ],
    "Các mức giá trên trang phòng là thông tin tham khảo. Hãy trao đổi trực tiếp để kiểm tra phương án lưu trú cho lịch trình của bạn trước khi chốt chuyến đi.",
  ],
  [
    "90s-7",
    "Một hành trình mới",
    "Gợi ý chuẩn bị cho lần đầu ghé 90s",
    "Nếu đây là lần đầu tìm hiểu 90s, bạn có thể bắt đầu từ ảnh phòng, không gian ăn uống và những câu chuyện trên website. Mỗi mục giúp bạn hình dung một phần của chuyến đi thay vì phải quyết định ngay.",
    [
      "Xem trang chi tiết phòng để đối chiếu sức chứa và hướng nhìn.",
      "Lưu lại đường dẫn bài viết hoặc hạng phòng muốn hỏi thêm.",
      "Dùng kênh liên hệ chính thức trong mục Liên hệ để nhận tư vấn.",
    ],
    "Hãy chia sẻ nhu cầu của nhóm, kể cả những điều nhỏ như bữa ăn hay giờ di chuyển dự kiến. Những thông tin cụ thể giúp việc chuẩn bị phù hợp và tiết kiệm thời gian hơn.",
  ],
  [
    "90s-8",
    "Hẹn nhau trong chuyến đi tiếp theo",
    "Lưu lại những điều muốn trải nghiệm cùng nhau",
    "Sau một chuyến đi, đôi khi điều đáng nhớ nhất là một bữa ăn hay câu chuyện chưa kể hết. Bạn có thể bắt đầu kế hoạch tiếp theo bằng việc ghi lại những trải nghiệm cả nhóm muốn dành thêm thời gian.",
    [
      "Chọn thời điểm phù hợp với lịch chung của mọi người.",
      "Xem lại hạng phòng và số khách nếu nhóm có thay đổi.",
      "Chia sẻ nhu cầu sớm để có thời gian trao đổi phương án.",
    ],
    "Website luôn có chỗ để bạn tham khảo phòng, nội dung trải nghiệm và các bài viết mới. Khi sẵn sàng cho chuyến đi, hãy liên hệ để cùng lên một kế hoạch vừa sức.",
  ],
  [
    "tam-dao-1",
    "Tam Đảo: một khoảng nghỉ giữa núi",
    "Bắt đầu khám phá bằng một lịch trình vừa đủ",
    "Tam Đảo phù hợp với những chuyến đi muốn đổi không khí và tận hưởng nhịp sống chậm hơn. Bạn có thể kết hợp đi dạo trong thị trấn, thưởng thức bữa ăn và dành thời gian nghỉ tại nơi lưu trú.",
    [
      "Theo dõi dự báo thời tiết sát ngày khởi hành.",
      "Sắp xếp thời gian di chuyển để không phải vội khi đến nơi.",
      "Chọn ít điểm ghé nhưng dành đủ thời gian cho từng nơi.",
    ],
    "Một nơi nghỉ hợp nhu cầu sẽ giúp bạn có chỗ trở về giữa các hoạt động. Tham khảo hạng phòng và trao đổi lịch trình dự kiến để chủ động chuẩn bị.",
  ],
  [
    "tam-dao-2",
    "Một ngày thong thả ở Tam Đảo",
    "Cân bằng khám phá và thời gian nghỉ",
    "Bạn có thể dành buổi sáng cho một vòng đi dạo, buổi chiều tìm góc ngồi yên tĩnh và buổi tối dùng bữa cùng người thân. Điều quan trọng là giữ lịch trình linh hoạt khi thời tiết thay đổi.",
    [
      "Đọc trước đường đi và cân nhắc sức khỏe của cả nhóm.",
      "Chuẩn bị phương án nghỉ trong nhà nếu có mưa.",
      "Không xếp các hoạt động ở xa nhau quá sát giờ.",
    ],
    "Không cần đi hết mọi địa điểm trong một lần ghé. Một ngày có nhịp nghỉ hợp lý giúp bạn tận hưởng cảnh quan và trở về với cảm giác nhẹ nhàng hơn.",
  ],
  [
    "tam-dao-3",
    "Những góc nhìn đáng lưu lại",
    "Chụp ảnh và tận hưởng cảnh quan một cách thoải mái",
    "Khung cảnh vùng núi thay đổi theo mây, ánh sáng và thời tiết. Có lúc một con đường quen cũng trở nên khác lạ, vì vậy hãy dành thời gian quan sát thay vì chỉ tìm một góc ảnh cố định.",
    [
      "Giữ thiết bị gọn nhẹ và chú ý bề mặt trơn khi trời ẩm.",
      "Tôn trọng biển báo, khu vực riêng tư và người xung quanh.",
      "Chọn góc an toàn; không đứng sát mép dốc để chụp ảnh.",
    ],
    "Bạn có thể lưu những bức ảnh mình thích rồi tiếp tục chuyến đi mà không cần chạy theo quá nhiều điểm. Trải nghiệm thực tế luôn đáng dành thời gian hơn một lịch chụp kín.",
  ],
  [
    "tam-dao-4",
    "Ăn gì trong chuyến đi Tam Đảo?",
    "Bắt đầu từ khẩu vị và số người trong nhóm",
    "Lựa chọn bữa ăn sẽ dễ hơn khi cả nhóm thống nhất thích món nóng, món rau hay một bữa cơm dùng chung. Một thực đơn cân bằng cũng giúp chuyến đi thoải mái sau những quãng di chuyển.",
    [
      "Hỏi rõ khẩu phần, giá và món có thể chuẩn bị vào ngày đi.",
      "Thông báo dị ứng hoặc chế độ ăn riêng khi liên hệ.",
      "Thống nhất giờ ăn để tránh ảnh hưởng lịch nghỉ của nhóm.",
    ],
    "Mục Nhà hàng giới thiệu các nhóm món để bạn tham khảo. Hãy gửi lựa chọn cùng số khách dự kiến để nhận tư vấn phù hợp thay vì chỉ dựa vào hình ảnh.",
  ],
  [
    "tam-dao-5",
    "Chuẩn bị cho thời tiết vùng núi",
    "Những vật dụng nhỏ giúp chuyến đi dễ chịu hơn",
    "Thời tiết có thể ảnh hưởng đến kế hoạch đi dạo, trang phục và việc di chuyển. Chuẩn bị linh hoạt sẽ giúp bạn bớt bị động mà không phải mang quá nhiều đồ.",
    [
      "Mang áo khoác nhẹ, giày đế bám và đồ che mưa gọn.",
      "Bảo quản thiết bị điện tử trong túi phù hợp khi trời ẩm.",
      "Theo dõi dự báo và ưu tiên nghỉ ngơi nếu điều kiện không thuận lợi.",
    ],
    "Nếu đi cùng trẻ nhỏ hoặc người lớn tuổi, hãy dành thêm thời gian chuyển tiếp giữa các hoạt động. Một lịch trình có khoảng nghỉ luôn dễ điều chỉnh hơn.",
  ],
  [
    "tam-dao-6",
    "Lên lịch nghỉ cùng gia đình",
    "Để mỗi thành viên đều có khoảng thời gian dễ chịu",
    "Đi cùng gia đình thường có nhiều nhu cầu khác nhau về giấc ngủ, bữa ăn và tốc độ di chuyển. Bạn có thể bắt đầu từ việc chọn phòng đủ sức chứa rồi mới ghép các hoạt động xung quanh.",
    [
      "Kiểm tra số giường và trao đổi nhu cầu riêng trước khi chọn phòng.",
      "Chừa thời gian nghỉ giữa các điểm đi dạo.",
      "Mang theo vật dụng cá nhân cần thiết và thuốc đang sử dụng.",
    ],
    "Chia sẻ số người, độ tuổi và lịch trình dự kiến khi nhận tư vấn. Những thông tin này giúp lựa chọn lưu trú và bữa ăn gần với nhu cầu thực tế hơn.",
  ],
  [
    "tam-dao-7",
    "Một hành trình dành cho nhóm bạn",
    "Thống nhất kế hoạch trước khi cùng khởi hành",
    "Chuyến đi nhóm vui hơn khi mọi người cùng hiểu ngân sách, lịch di chuyển và cách chia phòng. Một cuộc trao đổi ngắn trước ngày đi có thể tránh được nhiều thay đổi vào phút cuối.",
    [
      "Cử một người tổng hợp số khách và nhu cầu của cả nhóm.",
      "Lưu chung thông tin đường đi, nơi nghỉ và các khoản đã thống nhất.",
      "Để lịch trình có hoạt động tự chọn cho những sở thích khác nhau.",
    ],
    "Nếu cần nhiều phòng, hãy gửi yêu cầu cùng thời gian dự kiến để trao đổi phương án. Không nên suy ra số phòng trống chỉ từ tổng số phòng được giới thiệu trên website.",
  ],
  [
    "tam-dao-8",
    "Những điều muốn giữ lại sau chuyến đi",
    "Một chút chuẩn bị cho lần trở lại",
    "Kết thúc chuyến đi là lúc bạn có thể ghi lại nơi đã thích, món muốn thử thêm và những điều nên chuẩn bị khác đi. Danh sách ngắn ấy sẽ hữu ích cho lần trở lại cùng gia đình hoặc bạn bè.",
    [
      "Lưu ảnh và đường dẫn hữu ích vào một thư mục chung.",
      "Ghi chú thời gian di chuyển thực tế và các nhu cầu của nhóm.",
      "Dọn sạch không gian đã sử dụng và kiểm tra đồ cá nhân trước khi về.",
    ],
    "Mỗi chuyến đi có thể mang một nhịp khác nhau. Hãy giữ lại điều khiến bạn thấy thoải mái, rồi dùng nó làm điểm bắt đầu cho kế hoạch tiếp theo.",
  ],
];

const images = [
  "assets/images/hero/hero-01.png",
  "assets/images/rooms/rooms-collage.png",
  "assets/images/cafe/cafe-collage.png",
  "assets/images/restaurant/food-collage.png",
];
export const editorialNews = Object.fromEntries(
  articles.map(([id, title, subtitle, intro, tips, closing], i) => {
    const contentDoc = [
      { type: "paragraph", text: intro },
      { type: "heading", text: "Gợi ý cho chuyến đi" },
      { type: "list", text: tips.join("\n") },
      { type: "image", src: images[i % images.length], text: subtitle },
      { type: "heading", text: "Chuẩn bị theo cách của bạn" },
      { type: "paragraph", text: closing },
      {
        type: "paragraph",
        text: "Xem phòng đôi view núi và thông tin lưu trú tại 90s",
        href: "/phong/double",
      },
    ];
    return [
      id,
      {
        title,
        subtitle,
        excerpt: intro,
        imageUrl: images[i % images.length],
        contentDoc,
        content: contentDoc
          .filter((b) => b.type !== "image")
          .map((b) => b.text)
          .join("\n\n"),
      },
    ];
  }),
);
