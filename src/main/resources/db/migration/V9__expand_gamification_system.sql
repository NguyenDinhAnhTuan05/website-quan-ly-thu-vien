-- ============================================================
-- Flyway Migration V9 — Mở rộng Gamification (Transaction, Missions, Badges)
-- ============================================================

-- 1. Bảng lưu lịch sử giao dịch điểm (Point Transactions)
CREATE TABLE point_transactions (
    id            BIGINT         NOT NULL AUTO_INCREMENT,
    user_id       BIGINT         NOT NULL,
    amount        INT            NOT NULL,             -- Số điểm (+ hoặc -)
    action_type   VARCHAR(50)    NOT NULL,             -- CHECK_IN, READ_BOOK, REVIEW_BOOK, REDEEM_SUB, etc.
    description   VARCHAR(255),
    reference_id  VARCHAR(100),                        -- ID của đối tượng liên quan (ví dụ: book_id, review_id)
    created_at    DATETIME       NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_pt_user FOREIGN KEY (user_id) REFERENCES users (id),
    INDEX idx_pt_user_id (user_id),
    INDEX idx_pt_action (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Nhiệm vụ (Missions)
CREATE TABLE missions (
    id            BIGINT         NOT NULL AUTO_INCREMENT,
    title         VARCHAR(100)   NOT NULL,
    description   TEXT,
    point_reward  INT            NOT NULL DEFAULT 0,
    mission_type  VARCHAR(50)    NOT NULL,             -- DAILY, ONE_TIME, MILESTONE
    requirement   INT            NOT NULL DEFAULT 1,   -- Số lần cần thực hiện (ví dụ: đọc 5 cuốn sách)
    is_active     TINYINT(1)     NOT NULL DEFAULT 1,
    created_at    DATETIME       NOT NULL,
    updated_at    DATETIME,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng tiến độ nhiệm vụ của người dùng (User Missions)
CREATE TABLE user_missions (
    id            BIGINT         NOT NULL AUTO_INCREMENT,
    user_id       BIGINT         NOT NULL,
    mission_id    BIGINT         NOT NULL,
    current_progress INT         NOT NULL DEFAULT 0,
    is_completed  TINYINT(1)     NOT NULL DEFAULT 0,
    completed_at  DATETIME,
    created_at    DATETIME       NOT NULL,
    updated_at    DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT fk_um_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_um_mission FOREIGN KEY (mission_id) REFERENCES missions (id),
    UNIQUE KEY uk_user_mission (user_id, mission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Huy hiệu (Badges)
CREATE TABLE badges (
    id            BIGINT         NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)   NOT NULL UNIQUE,
    description   TEXT,
    icon_url      VARCHAR(255),
    requirement_type VARCHAR(50) NOT NULL,             -- TOTAL_POINTS, TOTAL_BOOKS, etc.
    requirement_value INT        NOT NULL,
    created_at    DATETIME       NOT NULL,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng User đạt huy hiệu (User Badges)
CREATE TABLE user_badges (
    id            BIGINT         NOT NULL AUTO_INCREMENT,
    user_id       BIGINT         NOT NULL,
    badge_id      BIGINT         NOT NULL,
    earned_at     DATETIME       NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badges (id),
    UNIQUE KEY uk_user_badge (user_id, badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Insert dữ liệu mẫu cho Nhiệm vụ và Huy hiệu
INSERT INTO missions (title, description, point_reward, mission_type, requirement, is_active, created_at) VALUES
('Điểm danh hàng ngày', 'Nhận điểm thưởng mỗi ngày khi đăng nhập vào hệ thống.', 10, 'DAILY', 1, 1, NOW()),
('Mọt sách mới', 'Đọc cuốn sách đầu tiên của bạn.', 50, 'ONE_TIME', 1, 1, NOW()),
('Chuyên gia đánh giá', 'Viết 5 đánh giá cho các cuốn sách khác nhau.', 100, 'MILESTONE', 5, 1, NOW());

INSERT INTO badges (name, description, icon_url, requirement_type, requirement_value, created_at) VALUES
('Thành viên mới', 'Dành cho người dùng mới tham gia thư viện.', '/assets/badges/newbie.png', 'TOTAL_POINTS', 0, NOW()),
('Người đọc tích cực', 'Đã đọc hơn 10 cuốn sách.', '/assets/badges/active_reader.png', 'TOTAL_BOOKS', 10, NOW()),
('Triệu phú điểm', 'Sở hữu trên 1000 điểm tích lũy.', '/assets/badges/millionaire.png', 'TOTAL_POINTS', 1000, NOW());
