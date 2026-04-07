-- ============================================================
-- Flyway Migration V14 — Cập nhật điểm thưởng nhiệm vụ
-- ============================================================

UPDATE missions SET point_reward = 50 WHERE title = 'Điểm danh hàng ngày';
UPDATE missions SET point_reward = 100 WHERE title = 'Mọt sách mới';
UPDATE missions SET point_reward = 500 WHERE title = 'Chuyên gia đánh giá';
