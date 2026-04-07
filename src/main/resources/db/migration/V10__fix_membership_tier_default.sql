-- Fix: Đổi default membership_tier từ 'BASIC' thành 'BRONZE' cho khớp với Java enum
ALTER TABLE users ALTER COLUMN membership_tier SET DEFAULT 'BRONZE';
UPDATE users SET membership_tier = 'BRONZE' WHERE membership_tier = 'BASIC';
