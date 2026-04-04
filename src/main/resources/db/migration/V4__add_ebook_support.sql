-- ============================================================
-- Flyway Migration V4 — Hỗ trợ E-book và Metadata
-- ============================================================

ALTER TABLE books
ADD COLUMN ebook_url VARCHAR(500) DEFAULT NULL AFTER cover_url,
ADD COLUMN preview_url VARCHAR(500) DEFAULT NULL AFTER ebook_url,
ADD COLUMN page_count INT DEFAULT 0 AFTER preview_url,
ADD COLUMN language VARCHAR(10) DEFAULT 'vi' AFTER page_count;
