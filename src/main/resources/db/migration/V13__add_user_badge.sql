-- Thêm cột badge vào bảng users để lưu huy hiệu đang sử dụng
ALTER TABLE users ADD COLUMN badge VARCHAR(50) DEFAULT NULL;
