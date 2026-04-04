-- ============================================================
-- Flyway Migration V3 — Dữ liệu mẫu: tác giả & sách
-- ============================================================

-- ---- AUTHORS ------------------------------------------------
INSERT INTO authors (id, name, bio, deleted, created_at) VALUES
(1, 'Nam Cao', 'Nhà văn hiện thực phê phán nổi tiếng của Việt Nam.', 0, NOW()),
(2, 'Ngô Tất Tố', 'Nhà văn, nhà báo Việt Nam tiêu biểu thế kỷ 20.', 0, NOW()),
(3, 'Nguyễn Du', 'Đại thi hào dân tộc, tác giả Truyện Kiều.', 0, NOW()),
(4, 'Yuval Noah Harari', 'Sử gia người Israel, tác giả loạt sách Sapiens.', 0, NOW()),
(5, 'Dale Carnegie', 'Nhà văn, diễn giả người Mỹ chuyên về phát triển bản thân.', 0, NOW()),
(6, 'Napoleon Hill', 'Tác giả cuốn sách nổi tiếng Think and Grow Rich.', 0, NOW()),
(7, 'Stephen Hawking', 'Nhà vật lý lý thuyết và vũ trụ học nổi tiếng người Anh.', 0, NOW()),
(8, 'Robert T. Kiyosaki', 'Doanh nhân và tác giả sách tài chính cá nhân.', 0, NOW()),
(9, 'Tô Hoài', 'Nhà văn Việt Nam nổi tiếng với Dế Mèn phiêu lưu ký.', 0, NOW()),
(10, 'Nguyễn Nhật Ánh', 'Nhà văn Việt Nam chuyên viết cho thiếu nhi và tuổi mới lớn.', 0, NOW());

-- ---- BOOKS --------------------------------------------------
INSERT INTO books (id, title, isbn, description, cover_url, quantity, available_quantity, available, deleted, created_at) VALUES
(1,
 'Chí Phèo',
 '978-604-2-13001-1',
 'Tác phẩm kinh điển của Nam Cao kể về cuộc đời bi thảm của Chí Phèo — một nông dân lương thiện bị xã hội đẩy vào con đường lưu manh.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1328865637i/6990770.jpg',
 5, 5, 1, 0, NOW()),

(2,
 'Tắt Đèn',
 '978-604-2-13002-8',
 'Tiểu thuyết của Ngô Tất Tố phản ánh cuộc sống khổ cực của người nông dân Việt Nam dưới ách thực dân phong kiến qua hình ảnh chị Dậu.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388188547i/20614267.jpg',
 4, 4, 1, 0, NOW()),

(3,
 'Truyện Kiều',
 '978-604-2-13003-5',
 'Kiệt tác văn học Việt Nam của Nguyễn Du, kể về cuộc đời đầy thăng trầm của Thúy Kiều — một người con gái tài sắc vẹn toàn.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347369266i/8245701.jpg',
 3, 3, 1, 0, NOW()),

(4,
 'Sapiens: Lược Sử Loài Người',
 '978-604-2-23001-3',
 'Yuval Noah Harari dẫn dắt người đọc qua 70.000 năm lịch sử nhân loại từ thời đồ đá đến thời đại số — một trong những cuốn sách bán chạy nhất thế giới.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1595674533i/23692271.jpg',
 6, 6, 1, 0, NOW()),

(5,
 'Homo Deus: Lược Sử Tương Lai',
 '978-604-2-23002-0',
 'Phần tiếp theo của Sapiens, Harari khám phá tương lai của loài người trong thế giới công nghệ và trí tuệ nhân tạo.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1455468984i/31138556.jpg',
 4, 4, 1, 0, NOW()),

(6,
 'Đắc Nhân Tâm',
 '978-604-2-53001-2',
 'Cuốn sách phát triển bản thân kinh điển của Dale Carnegie, dạy cách giao tiếp, ảnh hưởng và chinh phục lòng người.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1442726934i/4865.jpg',
 8, 8, 1, 0, NOW()),

(7,
 'Nghĩ Giàu Làm Giàu',
 '978-604-2-53002-9',
 'Napoleon Hill đúc kết bí quyết thành công từ 500 người giàu nhất nước Mỹ, trở thành sách kinh doanh bán chạy mọi thời đại.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1463241782i/1005.jpg',
 5, 5, 1, 0, NOW()),

(8,
 'Lược Sử Thời Gian',
 '978-604-2-23003-7',
 'Stephen Hawking giải thích các khái niệm vũ trụ học phức tạp — từ Big Bang đến lỗ đen — theo cách dễ hiểu cho mọi người.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1349088726i/3869.jpg',
 3, 3, 1, 0, NOW()),

(9,
 'Cha Giàu Cha Nghèo',
 '978-604-2-33001-5',
 'Robert Kiyosaki chia sẻ quan điểm tài chính cá nhân khác biệt giữa hai người cha — một nghèo, một giàu — và bài học về đầu tư, tài sản.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387127640i/69571.jpg',
 7, 7, 1, 0, NOW()),

(10,
 'Dế Mèn Phiêu Lưu Ký',
 '978-604-2-13004-2',
 'Tác phẩm thiếu nhi kinh điển của Tô Hoài kể về cuộc phiêu lưu của chú Dế Mèn qua nhiều miền đất kỳ thú.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348960202i/1232391.jpg',
 10, 10, 1, 0, NOW()),

(11,
 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
 '978-604-2-13005-9',
 'Nguyễn Nhật Ánh đưa người đọc trở về tuổi thơ trong sáng, hồn nhiên qua những kỷ niệm và trò chơi của trẻ em làng quê Việt Nam.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348940590i/6407023.jpg',
 6, 6, 1, 0, NOW()),

(12,
 'Mắt Biếc',
 '978-604-2-13006-6',
 'Câu chuyện tình yêu da diết, buồn bã của Ngạn và Hà Lan — tác phẩm lãng mạn nổi tiếng nhất của Nguyễn Nhật Ánh.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1523097675i/39798065.jpg',
 5, 5, 1, 0, NOW());

-- ---- BOOK_AUTHOR links --------------------------------------
INSERT INTO book_author (book_id, author_id) VALUES
(1, 1), -- Chí Phèo - Nam Cao
(2, 2), -- Tắt Đèn - Ngô Tất Tố
(3, 3), -- Truyện Kiều - Nguyễn Du
(4, 4), -- Sapiens - Harari
(5, 4), -- Homo Deus - Harari
(6, 5), -- Đắc Nhân Tâm - Carnegie
(7, 6), -- Nghĩ Giàu Làm Giàu - Napoleon Hill
(8, 7), -- Lược Sử Thời Gian - Hawking
(9, 8), -- Cha Giàu Cha Nghèo - Kiyosaki
(10, 9), -- Dế Mèn - Tô Hoài
(11, 10), -- Cho Tôi Xin - Nguyễn Nhật Ánh
(12, 10); -- Mắt Biếc - Nguyễn Nhật Ánh

-- ---- BOOK_CATEGORY links ------------------------------------
-- Categories: 1=Văn học, 2=Khoa học, 3=Kinh tế, 4=Lịch sử, 5=Kỹ năng sống
INSERT INTO book_category (book_id, category_id) VALUES
(1, 1),  -- Chí Phèo - Văn học
(2, 1),  -- Tắt Đèn - Văn học
(3, 1),  -- Truyện Kiều - Văn học
(4, 4),  -- Sapiens - Lịch sử
(5, 2),  -- Homo Deus - Khoa học
(6, 5),  -- Đắc Nhân Tâm - Kỹ năng sống
(7, 5),  -- Nghĩ Giàu Làm Giàu - Kỹ năng sống
(7, 3),  -- Nghĩ Giàu Làm Giàu - Kinh tế
(8, 2),  -- Lược Sử Thời Gian - Khoa học
(9, 3),  -- Cha Giàu Cha Nghèo - Kinh tế
(9, 5),  -- Cha Giàu Cha Nghèo - Kỹ năng sống
(10, 1), -- Dế Mèn - Văn học
(11, 1), -- Cho Tôi Xin - Văn học
(12, 1); -- Mắt Biếc - Văn học
