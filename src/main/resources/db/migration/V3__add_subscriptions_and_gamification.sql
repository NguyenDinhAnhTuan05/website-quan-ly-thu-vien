-- ============================================================
-- Flyway Migration V3 — Thêm Gamification và Subscription
-- ============================================================

-- 1. Thêm cột Gamification và Hạng Thành Viên cho bảng Users
ALTER TABLE users
ADD COLUMN points INT NOT NULL DEFAULT 0 AFTER avatar_url,
ADD COLUMN membership_tier VARCHAR(20) NOT NULL DEFAULT 'BASIC' AFTER points;

-- 2. Tạo bảng Gói Đăng Ký (Subscription Plans)
CREATE TABLE subscription_plans (
    id            BIGINT         NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)   NOT NULL UNIQUE, -- Tên gói (e.g., PREMIUM_1_MONTH)
    description   TEXT,
    price         DECIMAL(10, 2) NOT NULL,        -- Giá tiền
    duration_days INT            NOT NULL,        -- Thời hạn (ví dụ: 30 ngày)
    max_borrow_books INT         NOT NULL DEFAULT 3, -- Số sách tối đa được mượn cùng lúc
    deleted       TINYINT(1)     NOT NULL DEFAULT 0,
    created_at    DATETIME       NOT NULL,
    updated_at    DATETIME,

    PRIMARY KEY (id),
    INDEX idx_subscription_plans_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tạo bảng Lịch sử Đăng Ký của Người Dùng (User Subscriptions)
CREATE TABLE user_subscriptions (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    user_id            BIGINT       NOT NULL,
    plan_id            BIGINT       NOT NULL,
    start_date         DATETIME     NOT NULL,
    end_date           DATETIME     NOT NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED
    payment_reference  VARCHAR(100), -- Mã giao dịch VNPay/MoMo
    deleted            TINYINT(1)   NOT NULL DEFAULT 0,
    created_at         DATETIME     NOT NULL,
    updated_at         DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_us_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans (id),
    INDEX idx_us_user_id (user_id),
    INDEX idx_us_status  (status),
    INDEX idx_us_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Chèn dữ liệu mẫu cho các gói Subscription
INSERT INTO subscription_plans (name, description, price, duration_days, max_borrow_books, deleted, created_at)
VALUES 
('Gói Cơ Bản (BASIC)', 'Mượn tối đa 3 sách vật lý. Miễn phí.', 0, 9999, 3, 0, NOW()),
('Gói Cao Cấp 1 Tháng (PREMIUM_1M)', 'Mượn tối đa 5 sách. Đọc E-book không giới hạn.', 100000, 30, 5, 0, NOW()),
('Gói Cao Cấp 6 Tháng (PREMIUM_6M)', 'Mượn tối đa 10 sách. Đọc E-book không giới hạn. Tiết kiệm 20%.', 480000, 180, 10, 0, NOW());
