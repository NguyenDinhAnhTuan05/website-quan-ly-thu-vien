<div align="center">

# 📚 LibraryHub — Hệ Thống Quản Lý Thư Viện Trực Tuyến

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Flutter](https://img.shields.io/badge/Flutter-3.2%2B-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Nền tảng quản lý thư viện hiện đại với Web App, Mobile App và AI Assistant tích hợp**

[🌐 Web App](#-web-app) · [📱 Mobile App](#-mobile-app) · [🚀 Cài đặt](#-cài-đặt-nhanh) · [🔌 API Docs](#-api-endpoints) · [✨ Tính năng](#-tính-năng)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [API Endpoints](#-api-endpoints)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Team](#-team)

---

## 🌟 Giới thiệu

**LibraryHub** là hệ thống quản lý thư viện full-stack hiện đại, bao gồm:

- 🖥️ **Web App** — React 18 + Tailwind CSS với dark/light theme
- 📱 **Mobile App** — Flutter cross-platform (Android/iOS)
- ⚙️ **Backend API** — Spring Boot 3.4.4 RESTful với JWT + OAuth2
- 🤖 **AI Assistant** — Tích hợp Google Gemini cho gợi ý sách thông minh
- 🎮 **Gamification** — Hệ thống điểm thưởng, nhiệm vụ, bảng xếp hạng

---

## ✨ Tính năng

### 👤 Người dùng
| Tính năng | Web | Mobile |
|-----------|:---:|:------:|
| Đăng ký / Đăng nhập JWT | ✅ | ✅ |
| OAuth2 (Google / GitHub) | ✅ | — |
| Tìm kiếm & lọc sách nâng cao | ✅ | ✅ |
| Đọc sách trực tuyến | ✅ | — |
| Mượn / trả sách | ✅ | ✅ |
| Đánh giá & bình luận | ✅ | — |
| Lịch sử mượn | ✅ | ✅ |
| Hồ sơ cá nhân + đổi avatar | ✅ | ✅ |
| AI gợi ý sách (Gemini) | ✅ | ✅ |
| Điểm danh hàng ngày | ✅ | ✅ |
| Nhiệm vụ & nhận điểm thưởng | ✅ | ✅ |
| Bảng xếp hạng tháng | ✅ | ✅ |
| Shop phần thưởng | ✅ | — |
| Đăng ký gói thành viên | ✅ | — |

### 🛡️ Quản trị viên
| Tính năng | Mô tả |
|-----------|-------|
| Dashboard tổng quan | Thống kê sách, người dùng, lượt mượn theo biểu đồ |
| Quản lý sách | Thêm/sửa/xóa, upload ảnh bìa qua Cloudinary |
| Quản lý danh mục | CRUD danh mục sách |
| Quản lý tác giả | Thêm/sửa/xóa tác giả, upload ảnh đại diện |
| Quản lý người dùng | Khóa/mở tài khoản, phân quyền |
| Quản lý bộ sách (Series) | Nhóm sách theo series |
| Nhập sách hàng loạt | Import từ file CSV/JSON |
| Nội dung sách AI | Tự động tạo tóm tắt, nội dung bằng AI |

---

## 🛠️ Tech Stack

### Backend
```
Spring Boot 3.4.4    — Core framework
Spring Security      — JWT Authentication + OAuth2 Social Login
Spring Data JPA      — ORM với MySQL
Flyway               — Database migration tự động (V1→V14)
Redis                — Cache & session management
Cloudinary           — Cloud image storage (avatar, book covers)
Google Gemini API    — AI assistant & content generation
JJWT 0.12.6          — JSON Web Token
Lombok               — Giảm boilerplate code
```

### Frontend (Web)
```
React 18             — UI library
Vite 7               — Build tool
Tailwind CSS 3.4     — Utility-first CSS
Zustand              — State management
React Router v6      — Client-side routing
Lucide React         — Icon library
Axios                — HTTP client
React Markdown       — Render AI markdown responses
```

### Mobile (Flutter)
```
Flutter SDK ≥ 3.2.0  — Cross-platform framework
Provider             — State management
CachedNetworkImage   — Image caching
SharedPreferences    — Local storage (token)
Google Fonts         — Typography
Shimmer              — Loading skeleton
http                 — HTTP client với token refresh
```

### Infrastructure
```
MySQL 8.0            — Primary database
Redis                — Caching layer
Docker + Compose     — Containerization
Maven                — Build tool
```

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│   ┌─────────────────┐         ┌──────────────────────┐  │
│   │  React Web App  │         │  Flutter Mobile App  │  │
│   │  (Vite + TW)    │         │  (Android / iOS)     │  │
│   └────────┬────────┘         └──────────┬───────────┘  │
└────────────┼─────────────────────────────┼──────────────┘
             │ HTTPS / REST API            │
┌────────────┼─────────────────────────────┼──────────────┐
│            ▼    SPRING BOOT API          ▼              │
│   ┌─────────────────────────────────────────────────┐   │
│   │  Spring Security (JWT + OAuth2)                 │   │
│   │  ├── AuthController    ├── BookController       │   │
│   │  ├── UserController    ├── BorrowController     │   │
│   │  ├── GamificationCtrl  ├── AdminController      │   │
│   │  └── AiAssistantCtrl   └── FileUploadController │   │
│   └────────────────────┬────────────────────────────┘   │
│              SERVICE LAYER                              │
│   ┌──────────┐ ┌───────────┐ ┌────────────────────┐    │
│   │  MySQL   │ │   Redis   │ │  Cloudinary + AI   │    │
│   │ (Flyway) │ │  (Cache)  │ │  (External APIs)   │    │
│   └──────────┘ └───────────┘ └────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Cài đặt nhanh

### Yêu cầu
- Java 17+
- Node.js 18+
- MySQL 8.0
- Redis 7+
- Flutter SDK 3.2+
- Maven 3.9+

### 1. Clone repository

```bash
git clone https://github.com/NguyenDinhAnhTuan05/website-quan-ly-thu-vien.git
cd website-quan-ly-thu-vien
```

### 2. Tạo database

```sql
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Flyway sẽ tự động chạy migrations V1→V14 khi khởi động backend.

### 3. Cấu hình môi trường

Tạo file `src/main/resources/application-local.properties` (hoặc dùng biến môi trường):

```properties
# Database
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_minimum_64_chars

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Chạy Backend

```bash
./mvnw.cmd spring-boot:run        # Windows
./mvnw spring-boot:run            # Linux/Mac
```

> API chạy tại: `http://localhost:8080`

### 5. Chạy Frontend Web

```bash
cd frontend
npm install
npm run dev
```

> Web app chạy tại: `http://localhost:5173`

### 6. Chạy Mobile App

```bash
cd mobile-app
flutter pub get
flutter run
```

> Đổi `baseUrl` trong `lib/core/constants.dart`:
> - Emulator Android: `http://10.0.2.2:8080/api`
> - Thiết bị thật: `http://<YOUR_LOCAL_IP>:8080/api`

### 7. Docker (tùy chọn)

```bash
docker-compose up -d
```

---

## ⚙️ Cấu hình môi trường

| Biến | Mô tả | Mặc định |
|------|-------|---------|
| `DB_USERNAME` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | _(trống)_ |
| `DB_HOST` | MySQL host | `localhost` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing key (≥64 chars) | — |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | — |

---

## 🔌 API Endpoints

### 🔐 Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | Đăng nhập, nhận JWT |
| `POST` | `/api/auth/refresh` | Làm mới access token |
| `POST` | `/api/auth/forgot-password` | Gửi email reset |
| `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu |

### 📖 Books
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/books` | Danh sách sách (phân trang, lọc) |
| `GET` | `/api/books/{id}` | Chi tiết sách |
| `GET` | `/api/books/popular` | Sách phổ biến |
| `GET` | `/api/books/search` | Tìm kiếm nâng cao |
| `POST` | `/api/books` | Thêm sách _(Admin)_ |
| `PUT` | `/api/books/{id}` | Cập nhật sách _(Admin)_ |
| `DELETE` | `/api/books/{id}` | Xóa sách _(Admin)_ |

### 📦 Borrows
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/borrows` | Mượn sách |
| `PUT` | `/api/borrows/{id}/return` | Trả sách |
| `GET` | `/api/borrows/my-history` | Lịch sử của tôi |
| `GET` | `/api/borrows` | Tất cả lượt mượn _(Admin)_ |

### 🎮 Gamification
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/gamification/summary` | Thống kê điểm của tôi |
| `GET` | `/api/gamification/missions` | Danh sách nhiệm vụ |
| `POST` | `/api/gamification/daily-check-in` | Điểm danh hàng ngày |
| `GET` | `/api/gamification/leaderboard` | Bảng xếp hạng tháng |
| `GET` | `/api/gamification/rewards` | Danh sách phần thưởng |
| `POST` | `/api/gamification/redeem` | Đổi phần thưởng |

### 👤 User
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/users/me` | Thông tin cá nhân |
| `PUT` | `/api/users/me` | Cập nhật hồ sơ |
| `PUT` | `/api/users/me/password` | Đổi mật khẩu |

### 🤖 AI
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/ai/chat` | Chat với AI Assistant |
| `POST` | `/api/ai/recommend` | Gợi ý sách cá nhân hoá |

### 📤 Upload
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/upload/avatar` | Upload ảnh đại diện |
| `POST` | `/api/upload/book-cover` | Upload ảnh bìa sách |
| `POST` | `/api/upload/author-avatar` | Upload ảnh tác giả |

---

## 📁 Cấu trúc dự án

```
website-quan-ly-thu-vien/
│
├── 📂 src/                          # Backend Spring Boot
│   └── main/
│       ├── java/com/nhom10/library/
│       │   ├── controller/          # REST Controllers (19 files)
│       │   ├── service/             # Business logic
│       │   ├── repository/          # Spring Data JPA
│       │   ├── entity/              # JPA Entities
│       │   ├── dto/                 # Request/Response DTOs
│       │   ├── security/            # JWT + OAuth2
│       │   ├── config/              # AppConfig, SecurityConfig
│       │   └── exception/           # Global exception handler
│       └── resources/
│           ├── application.properties
│           ├── application.yml
│           └── db/migration/        # Flyway V1–V14
│
├── 📂 frontend/                     # React Web App
│   └── src/
│       ├── pages/                   # 20+ trang
│       │   ├── admin/               # Dashboard quản trị
│       │   ├── HomePage.jsx
│       │   ├── BookCatalogPage.jsx
│       │   ├── UserDashboardPage.jsx
│       │   └── ...
│       ├── components/              # Reusable components
│       │   ├── admin/               # AdminBookForm, AdminAuthorForm
│       │   └── dashboard/           # Leaderboard, RewardShop
│       ├── api/                     # API layer (axios)
│       ├── store/                   # Zustand stores
│       └── layouts/                 # Layout wrappers
│
├── 📂 mobile-app/                   # Flutter App
│   └── lib/
│       ├── core/                    # constants.dart, error_messages.dart
│       ├── services/                # ApiService, AuthService
│       └── screens/
│           ├── home/                # Trang chủ
│           ├── explore/             # Khám phá sách
│           ├── ai/                  # AI Chat
│           ├── history/             # Lịch sử mượn
│           ├── leaderboard/         # Bảng xếp hạng
│           ├── gamification/        # Nhiệm vụ & điểm thưởng
│           └── profile/             # Hồ sơ cá nhân
│
├── 📂 uploads/                      # Local file uploads (fallback)
├── 🐳 docker-compose.yml
├── 🐳 Dockerfile
└── 📄 pom.xml
```

---

## 🗃️ Database Schema

Flyway migrations (V1 → V14):

| Version | Nội dung |
|---------|---------|
| V1 | Schema khởi tạo: users, books, categories, authors |
| V2 | Bảng borrows + borrow_records |
| V3 | JWT refresh tokens |
| V4 | Gamification: missions, point_transactions |
| V5 | Reviews & ratings |
| V6 | Subscriptions & payment plans |
| V7 | OAuth2 provider fields |
| V8 | Book series |
| V9 | Book content (AI) |
| V10 | Fix membership tier defaults |
| V11 | Rewards system |
| V12 | Reward validity dates |
| V13 | User badge field |
| V14 | Update mission point rewards |

---

## 🔒 Bảo mật

- **JWT Authentication** — Access token (15 phút) + Refresh token (7 ngày)
- **OAuth2** — Đăng nhập Google / GitHub
- **Role-Based Access Control** — `ROLE_USER`, `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`
- **Password Hashing** — BCrypt
- **SQL Injection** — Ngăn chặn bằng Spring Data JPA Parameterized Query
- **CORS** — Chỉ cho phép origins được cấu hình
- **File Upload** — Kiểm tra loại file và giới hạn kích thước (5MB)
- **Input Validation** — JSR-380 Bean Validation trên tất cả Request DTOs

---

## 📱 Mobile App — Màn hình

| Tab | Màn hình | Mô tả |
|-----|----------|-------|
| 🏠 Trang chủ | `HomeScreen` | Sách nổi bật, mới nhất |
| 🔍 Khám phá | `ExploreScreen` | Tìm kiếm, lọc theo danh mục |
| 🤖 AI | `AIChatScreen` | Chat với AI gợi ý sách |
| 📋 Lịch sử | `HistoryScreen` | Lịch sử mượn trả |
| 🏆 Xếp hạng | `LeaderboardScreen` | Top người dùng tháng (podium) |
| ⭐ Nhiệm vụ | `GamificationScreen` | Nhiệm vụ, điểm danh, tiến độ |
| 👤 Cá nhân | `ProfileScreen` | Hồ sơ, đổi mật khẩu, avatar |

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m "feat: mô tả tính năng"`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## 👥 Team

**Nhóm 10** — Đồ án môn Phát triển ứng dụng Web & Mobile

| Thành viên | Vai trò |
|-----------|---------|
| Nguyễn Đình Anh Tuấn | Backend + Frontend + Mobile |

---

## 📄 License

Dự án được phát hành dưới giấy phép [MIT](LICENSE).

---

<div align="center">

Made with ❤️ by **Nhóm 10**

⭐ **Nếu thấy hữu ích, hãy cho một star nhé!** ⭐

</div>
