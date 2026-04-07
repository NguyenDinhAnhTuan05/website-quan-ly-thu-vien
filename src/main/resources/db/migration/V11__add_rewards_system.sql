-- ============================================================
-- Flyway Migration V11 — Hệ thống Đổi Điểm (Rewards)
-- ============================================================

-- 1. Bảng phần thưởng (Rewards Catalog)
CREATE TABLE rewards (
    id              BIGINT         NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)   NOT NULL,
    description     TEXT,
    icon            VARCHAR(50)    DEFAULT '🎁',
    point_cost      INT            NOT NULL,
    reward_type     VARCHAR(50)    NOT NULL,  -- SUBSCRIPTION, EXTRA_BORROW, DISCOUNT, BADGE
    reference_id    VARCHAR(100),             -- ID tham chiếu (plan_id cho SUBSCRIPTION, badge_id cho BADGE)
    stock           INT            NOT NULL DEFAULT -1,  -- -1 = không giới hạn
    is_active       TINYINT(1)     NOT NULL DEFAULT 1,
    created_at      DATETIME       NOT NULL,
    updated_at      DATETIME,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng lịch sử đổi thưởng (Reward Redemptions)
CREATE TABLE reward_redemptions (
    id              BIGINT         NOT NULL AUTO_INCREMENT,
    user_id         BIGINT         NOT NULL,
    reward_id       BIGINT         NOT NULL,
    points_spent    INT            NOT NULL,
    status          VARCHAR(20)    NOT NULL DEFAULT 'COMPLETED',  -- COMPLETED, CANCELLED
    redeemed_at     DATETIME       NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_rr_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_rr_reward FOREIGN KEY (reward_id) REFERENCES rewards (id),
    INDEX idx_rr_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Dữ liệu mẫu phần thưởng
INSERT INTO rewards (name, description, icon, point_cost, reward_type, reference_id, stock, is_active, created_at) VALUES
('Gói Premium 1 Tháng', 'Đổi điểm lấy gói cao cấp 1 tháng. Mượn tối đa 5 sách, đọc E-book không giới hạn.', '👑', 500, 'SUBSCRIPTION', '2', -1, 1, NOW()),
('Gói Premium 6 Tháng', 'Đổi điểm lấy gói cao cấp 6 tháng. Mượn tối đa 10 sách. Tiết kiệm hơn!', '💎', 2500, 'SUBSCRIPTION', '3', -1, 1, NOW()),
('Thêm 2 Slot Mượn Sách', 'Tăng thêm 2 slot mượn sách trong 30 ngày.', '📚', 200, 'EXTRA_BORROW', '2', -1, 1, NOW()),
('Giảm 50% Gói Premium', 'Nhận mã giảm 50% cho lần mua gói Premium tiếp theo.', '🏷️', 300, 'DISCOUNT', '50', -1, 1, NOW()),
('Huy Hiệu Độc Giả VIP', 'Huy hiệu đặc biệt hiển thị trên hồ sơ của bạn.', '🏅', 1000, 'BADGE', 'vip_reader', 50, 1, NOW());
