-- ============================================================
-- Flyway Migration V1 — Khởi tạo schema ban đầu
-- Project   : Web Quản Lý Thư Viện
-- Database  : MySQL 8.x
-- Encoding  : utf8mb4 (hỗ trợ emoji, unicode đầy đủ)
-- Collation : utf8mb4_unicode_ci (so sánh không phân biệt hoa/thường)
--
-- Quy ước:
--   - deleted TINYINT(1) DEFAULT 0  → soft-delete flag (0=active, 1=deleted)
--   - Tất cả FK đều có tên constraint rõ ràng (fk_<table>_<ref>)
--   - Index cho các cột hay dùng trong WHERE / JOIN / ORDER BY
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    username       VARCHAR(50)  UNIQUE,
    email          VARCHAR(100) NOT NULL UNIQUE,
    -- Nullable: user OAuth2 không có password local
    password       VARCHAR(255),
    role           VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    -- Admin bật/tắt tài khoản
    enabled        TINYINT(1)   NOT NULL DEFAULT 1,
    provider       VARCHAR(20)  NOT NULL DEFAULT 'LOCAL',
    -- ID của user trên hệ thống OAuth2 (Google sub, GitHub id...)
    provider_id    VARCHAR(255),
    avatar_url     VARCHAR(500),
    deleted        TINYINT(1)   NOT NULL DEFAULT 0,
    created_at     DATETIME     NOT NULL,
    updated_at     DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT uk_users_email    UNIQUE (email),
    CONSTRAINT uk_users_username UNIQUE (username),
    INDEX idx_users_deleted (deleted),
    INDEX idx_users_role    (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE categories (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    deleted     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT uk_categories_name UNIQUE (name),
    INDEX idx_categories_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: authors
-- ============================================================
CREATE TABLE authors (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150) NOT NULL,
    bio         TEXT,
    avatar_url  VARCHAR(500),
    deleted     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME,

    PRIMARY KEY (id),
    INDEX idx_authors_deleted (deleted),
    INDEX idx_authors_name   (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: books
-- ============================================================
CREATE TABLE books (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    title               VARCHAR(255) NOT NULL,
    isbn                VARCHAR(20)  UNIQUE,
    description         TEXT,
    cover_url           VARCHAR(500),
    -- Tổng số bản vật lý
    quantity            INT          NOT NULL DEFAULT 1,
    -- Số bản còn có thể mượn (cập nhật khi mượn/trả trong Service)
    available_quantity  INT          NOT NULL DEFAULT 1,
    -- Admin bật/tắt thủ công
    available           TINYINT(1)   NOT NULL DEFAULT 1,
    published_date      DATE,
    deleted             TINYINT(1)   NOT NULL DEFAULT 0,
    created_at          DATETIME     NOT NULL,
    updated_at          DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT uk_books_isbn UNIQUE (isbn),
    -- Composite index: tìm sách còn mượn được
    INDEX idx_books_available_deleted (available, deleted),
    INDEX idx_books_deleted (deleted),
    -- Full-text search cho tên sách (dùng MATCH...AGAINST trong Native Query)
    FULLTEXT INDEX ft_books_title (title),

    CONSTRAINT chk_books_quantity CHECK (quantity >= 0),
    CONSTRAINT chk_books_avail_qty CHECK (available_quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: book_category (JOIN TABLE — @ManyToMany)
-- Không có deleted/audit vì đây là bảng nối thuần
-- ============================================================
CREATE TABLE book_category (
    book_id     BIGINT NOT NULL,
    category_id BIGINT NOT NULL,

    PRIMARY KEY (book_id, category_id),
    CONSTRAINT fk_bc_book     FOREIGN KEY (book_id)     REFERENCES books      (id),
    CONSTRAINT fk_bc_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: book_author (JOIN TABLE — @ManyToMany)
-- ============================================================
CREATE TABLE book_author (
    book_id   BIGINT NOT NULL,
    author_id BIGINT NOT NULL,

    PRIMARY KEY (book_id, author_id),
    CONSTRAINT fk_ba_book   FOREIGN KEY (book_id)   REFERENCES books   (id),
    CONSTRAINT fk_ba_author FOREIGN KEY (author_id) REFERENCES authors (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: borrow_records
-- ============================================================
CREATE TABLE borrow_records (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    -- PENDING | BORROWING | RETURNED | OVERDUE
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    borrow_date DATE,
    due_date    DATE,
    return_date DATE,
    note        TEXT,
    deleted     TINYINT(1)  NOT NULL DEFAULT 0,
    created_at  DATETIME    NOT NULL,
    updated_at  DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT fk_br_user FOREIGN KEY (user_id) REFERENCES users (id),
    INDEX idx_br_user_id (user_id),
    INDEX idx_br_status  (status),
    INDEX idx_br_deleted (deleted),
    -- Quan trọng: tìm record quá hạn theo due_date
    INDEX idx_br_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: borrow_details
-- ============================================================
CREATE TABLE borrow_details (
    id               BIGINT     NOT NULL AUTO_INCREMENT,
    borrow_record_id BIGINT     NOT NULL,
    book_id          BIGINT     NOT NULL,
    deleted          TINYINT(1) NOT NULL DEFAULT 0,
    created_at       DATETIME   NOT NULL,
    updated_at       DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT fk_bd_borrow_record FOREIGN KEY (borrow_record_id) REFERENCES borrow_records (id),
    CONSTRAINT fk_bd_book          FOREIGN KEY (book_id)          REFERENCES books          (id),
    INDEX idx_bd_borrow_record_id (borrow_record_id),
    INDEX idx_bd_book_id          (book_id),
    INDEX idx_bd_deleted          (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE reviews (
    id         BIGINT     NOT NULL AUTO_INCREMENT,
    user_id    BIGINT     NOT NULL,
    book_id    BIGINT     NOT NULL,
    rating     INT        NOT NULL,
    comment    TEXT,
    deleted    TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME   NOT NULL,
    updated_at DATETIME,

    PRIMARY KEY (id),
    -- 1 user chỉ review 1 cuốn 1 lần
    CONSTRAINT uk_reviews_user_book UNIQUE (user_id, book_id),
    CONSTRAINT fk_reviews_user      FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_reviews_book      FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT chk_rating           CHECK (rating >= 1 AND rating <= 5),
    INDEX idx_reviews_book_id (book_id),
    INDEX idx_reviews_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: password_reset_tokens
-- ============================================================
CREATE TABLE password_reset_tokens (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       TINYINT(1)   NOT NULL DEFAULT 0,
    deleted    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL,
    updated_at DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT uk_prt_token UNIQUE (token),
    CONSTRAINT fk_prt_user  FOREIGN KEY (user_id) REFERENCES users (id),
    INDEX idx_prt_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA — Tài khoản Admin mặc định
--
-- password = "Admin@123"
-- Hash dưới đây được tạo bởi BCryptPasswordEncoder với strength=12.
-- Khi deploy production, thay bằng lệnh:
--   UPDATE users SET password = '<hash_thực_tế>' WHERE email = 'admin@library.com';
-- ============================================================
INSERT INTO users (username, email, password, role, enabled, provider, deleted, created_at)
VALUES (
    'admin',
    'admin@library.com',
    '$2a$12$rv3.0j8QJAfXS97lvF8.BuPbpMIilFAKCp79OFMSwemicpGb6bWVu',  -- Admin@123
    'ROLE_ADMIN',
    1,
    'LOCAL',
    0,
    NOW()
);

-- ============================================================
-- SEED DATA — Thể loại mẫu
-- ============================================================
INSERT INTO categories (name, deleted, created_at) VALUES
    ('Văn học',             0, NOW()),
    ('Khoa học & Công nghệ', 0, NOW()),
    ('Kinh tế & Kinh doanh', 0, NOW()),
    ('Lịch sử & Địa lý',    0, NOW()),
    ('Kỹ năng sống',        0, NOW());
