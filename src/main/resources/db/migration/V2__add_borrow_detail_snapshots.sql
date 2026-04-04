-- ============================================================
-- Flyway Migration V2 — Bổ sung snapshot sách vào phiếu mượn
-- Mục đích:
--   Khi admin xóa (soft-delete) một cuốn sách, lịch sử mượn
--   vẫn phải hiển thị đủ thông tin sách tại thời điểm mượn.
--   → Lưu snapshot: title, cover_url, isbn vào borrow_details.
--
-- Ghi chú:
--   - Các cột snapshot là NULLABLE để tương thích với dữ liệu cũ.
--   - BorrowService sẽ điền các cột này khi tạo phiếu mượn mới.
-- ============================================================

ALTER TABLE borrow_details
    ADD COLUMN snapshot_title     VARCHAR(255) NULL COMMENT 'Tên sách tại thời điểm mượn'  AFTER book_id,
    ADD COLUMN snapshot_cover_url VARCHAR(500) NULL COMMENT 'Ảnh bìa tại thời điểm mượn'  AFTER snapshot_title,
    ADD COLUMN snapshot_isbn      VARCHAR(20)  NULL COMMENT 'ISBN tại thời điểm mượn'      AFTER snapshot_cover_url;
