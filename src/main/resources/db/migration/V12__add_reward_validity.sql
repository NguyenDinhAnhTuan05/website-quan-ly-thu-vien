-- ============================================================
-- Flyway Migration V12 — Thêm thời hạn sử dụng cho phần thưởng
-- ============================================================

-- 1. Thêm cột validity_days vào bảng rewards (số ngày hiệu lực, NULL = vĩnh viễn)
ALTER TABLE rewards ADD COLUMN validity_days INT DEFAULT NULL AFTER stock;

-- 2. Thêm cột expires_at vào bảng reward_redemptions
ALTER TABLE reward_redemptions ADD COLUMN expires_at DATETIME DEFAULT NULL AFTER redeemed_at;

-- 3. Cập nhật thời hạn cho các phần thưởng hiện có
-- Gói Premium 1 tháng → 30 ngày
UPDATE rewards SET validity_days = 30 WHERE reward_type = 'SUBSCRIPTION' AND name LIKE '%1 Tháng%';
-- Gói Premium 6 tháng → 180 ngày
UPDATE rewards SET validity_days = 180 WHERE reward_type = 'SUBSCRIPTION' AND name LIKE '%6 Tháng%';
-- Extra borrow → 30 ngày
UPDATE rewards SET validity_days = 30 WHERE reward_type = 'EXTRA_BORROW';
-- Discount → 90 ngày
UPDATE rewards SET validity_days = 90 WHERE reward_type = 'DISCOUNT';
-- Badge → vĩnh viễn (NULL)
