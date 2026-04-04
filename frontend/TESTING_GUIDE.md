# 🎨 Hướng dẫn Test Frontend Mới

## ✅ Đã hoàn thành

### Design System
- ✅ Color palette chuyên nghiệp (Blue-gray primary, Amber accent)
- ✅ Typography system với font hierarchy rõ ràng
- ✅ Button system (6 variants: primary, secondary, outline, ghost, danger + sizes)
- ✅ Card system với hover effects
- ✅ Input/Form system với validation states
- ✅ Badge system (5 colors)
- ✅ Toast notifications
- ✅ Loading states (spinner, skeleton)

### Components
- ✅ Navigation - Logo gradient, clean menu, mobile responsive
- ✅ Footer - Professional layout
- ✅ BookCard - Hover effects, rating stars, availability badges
- ✅ BookFilter - Clean filter UI
- ✅ ProtectedRoute - Route protection

### Pages
- ✅ HomePage - Hero section, featured books, CTA
- ✅ LoginPage - Clean auth form
- ✅ RegisterPage - Multi-step validation
- ✅ ForgotPasswordPage - Password reset flow
- ✅ BookCatalogPage - Grid layout, pagination
- ✅ BookDetailPage - Full book info, reviews system
- ✅ UserDashboardPage - User stats, borrow history
- ✅ AdminDashboardPage - Full admin panel (books, borrows, users management)

## 🚀 Cách chạy Frontend

### 1. Development Mode
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy tại: http://localhost:3000

### 2. Build Production
```bash
cd frontend
npm run build
```
Output sẽ được tạo tại: `../src/main/resources/static`

## 🧪 Test Checklist

### Public Pages (Không cần đăng nhập)
- [ ] **HomePage** (/)
  - [ ] Hero section hiển thị đúng
  - [ ] Featured books load được
  - [ ] Popular books load được
  - [ ] CTA section cho user chưa đăng nhập
  - [ ] Features section

- [ ] **BookCatalogPage** (/book)
  - [ ] Danh sách sách hiển thị dạng grid
  - [ ] Filter hoạt động (search, category, sort)
  - [ ] Pagination hoạt động
  - [ ] Click vào sách → chuyển đến detail page

- [ ] **BookDetailPage** (/books/:id)
  - [ ] Thông tin sách hiển thị đầy đủ
  - [ ] Rating stars hiển thị
  - [ ] Reviews list hiển thị
  - [ ] Button "Mượn sách" → redirect đến login nếu chưa đăng nhập

- [ ] **LoginPage** (/login)
  - [ ] Form validation hoạt động
  - [ ] Show/hide password
  - [ ] Link "Quên mật khẩu"
  - [ ] Link "Đăng ký"
  - [ ] Đăng nhập thành công → redirect đến dashboard

- [ ] **RegisterPage** (/register)
  - [ ] Form validation (username, email, password, confirm password)
  - [ ] Checkbox "Đồng ý điều khoản"
  - [ ] Đăng ký thành công → redirect đến dashboard

- [ ] **ForgotPasswordPage** (/forgot-password)
  - [ ] Nhập email
  - [ ] Hiển thị message sau khi gửi

### User Pages (Cần đăng nhập)
- [ ] **UserDashboardPage** (/dashboard)
  - [ ] User info hiển thị (avatar, username, email, role)
  - [ ] Stats cards (Tổng phiếu, Đang mượn, Đã trả, Quá hạn)
  - [ ] Tabs (Tất cả, Đang mượn, Lịch sử)
  - [ ] Danh sách phiếu mượn với status badges
  - [ ] Button "Hủy phiếu" cho phiếu PENDING
  - [ ] Warning cho phiếu OVERDUE
  - [ ] Button "Đăng xuất"

- [ ] **Mượn sách flow**
  - [ ] Click "Mượn sách" từ BookCard
  - [ ] Toast notification hiển thị
  - [ ] Phiếu mượn xuất hiện trong dashboard với status PENDING

### Admin Pages (Cần role ADMIN/SUPER_ADMIN)
- [ ] **AdminDashboardPage** (/admin)
  - [ ] **Tab Dashboard**
    - [ ] Stats cards (Tổng sách, Lượt mượn, Người dùng, Quá hạn)
    - [ ] Chú thích trạng thái

  - [ ] **Tab Sách**
    - [ ] Search sách
    - [ ] Button "Thêm sách" → Modal form
    - [ ] Button "Cào Google Books"
    - [ ] Table danh sách sách
    - [ ] Button "Sửa" → Modal form với data
    - [ ] Button "Xóa" → Confirm dialog
    - [ ] Button "Ẩn/Hiện" → Toggle status

  - [ ] **Tab Mượn/Trả**
    - [ ] Filter theo status
    - [ ] Danh sách phiếu mượn
    - [ ] Button "Duyệt" cho phiếu PENDING
    - [ ] Button "Từ chối" cho phiếu PENDING
    - [ ] Button "Xác nhận trả" cho phiếu BORROWING/OVERDUE

  - [ ] **Tab Người dùng**
    - [ ] Search user
    - [ ] Table danh sách users
    - [ ] Button "Khóa/Kích hoạt"
    - [ ] Button "Xóa"

### Responsive Design
- [ ] Mobile (< 768px)
  - [ ] Navigation hamburger menu
  - [ ] Cards stack vertically
  - [ ] Tables scroll horizontally
  - [ ] Forms full width

- [ ] Tablet (768px - 1024px)
  - [ ] 2 columns grid
  - [ ] Sidebar navigation

- [ ] Desktop (> 1024px)
  - [ ] 4 columns grid
  - [ ] Full layout

### UI/UX Details
- [ ] Hover effects trên buttons, cards, links
- [ ] Loading states (spinner) khi fetch data
- [ ] Toast notifications cho success/error
- [ ] Smooth transitions
- [ ] Focus states cho accessibility
- [ ] Empty states với illustrations
- [ ] Error states với messages

## 🐛 Known Issues & Fixes

### Backend Connection
Đảm bảo backend đang chạy tại `http://localhost:8080`

### CORS Issues
Nếu gặp CORS error, kiểm tra `SecurityConfig.java`:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    return source;
}
```

### API Endpoints
Kiểm tra các API endpoints trong `frontend/src/api/`:
- authApi.js
- bookApi.js
- borrowApi.js
- reviewApi.js
- adminApi.js
- categoryApi.js
- authorApi.js

## 📝 Test Accounts

### Admin Account
```
Email: admin@library.com
Password: admin123
```

### User Account
```
Email: user@library.com
Password: user123
```

## 🎯 Next Steps

1. ✅ Test tất cả pages
2. ✅ Test tất cả user flows
3. ✅ Test responsive design
4. ✅ Fix bugs nếu có
5. ✅ Optimize performance
6. ✅ Add more features nếu cần

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console log trong browser (F12)
2. Network tab để xem API calls
3. Backend logs
4. Database data

---

**Designed & Built by**: Senior Frontend Developer (10 years experience)
**Design System**: Professional, Minimal, Modern
**Tech Stack**: React 18 + Vite 7 + Tailwind CSS 3.4
