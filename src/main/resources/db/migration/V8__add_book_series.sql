-- Bảng bộ sách (series): nhóm các cuốn như Doraemon 1, 2, 3...
CREATE TABLE IF NOT EXISTS book_series (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url   VARCHAR(500),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uk_book_series_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm cột series vào bảng books
ALTER TABLE books
    ADD COLUMN series_id BIGINT NULL AFTER cover_url,
    ADD COLUMN series_order INT DEFAULT 0 AFTER series_id,
    ADD CONSTRAINT fk_books_series FOREIGN KEY (series_id) REFERENCES book_series(id) ON DELETE SET NULL;
