package com.nhom10.library.entity.enums;

/**
 * Role của người dùng trong hệ thống.
 * Dùng EnumType.STRING để dễ đọc trong DB, không bị lỗi khi thêm enum mới.
 *
 * Phân cấp (level càng cao = càng nhiều quyền):
 *   ROLE_USER        (1) — Người dùng thường
 *   ROLE_ADMIN       (2) — Quản trị viên thư viện
 *   ROLE_SUPER_ADMIN (3) — Quản trị viên cấp cao (chỉ seed từ DB)
 *
 * Quy tắc phân quyền:
 *   - Mỗi role chỉ có thể quản lý (thay đổi/khóa/xóa) user có level THẤP HƠN.
 *   - ROLE_ADMIN     : chỉ quản lý ROLE_USER.
 *   - ROLE_SUPER_ADMIN: quản lý ROLE_USER và ROLE_ADMIN.
 *   - Không ai có thể thao tác lên chính mình.
 */
public enum Role {

    ROLE_USER(1),
    ROLE_ADMIN(2),
    ROLE_SUPER_ADMIN(3);

    private final int level;

    Role(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }

    /**
     * Kiểm tra role này có đủ quyền quản lý role kia không.
     * Điều kiện: level của role này phải CAO HƠN (strictly greater) role kia.
     * Ví dụ: ROLE_ADMIN.canManage(ROLE_USER) = true
     *        ROLE_ADMIN.canManage(ROLE_ADMIN) = false (cùng cấp)
     *        ROLE_ADMIN.canManage(ROLE_SUPER_ADMIN) = false (cấp cao hơn)
     */
    public boolean canManage(Role other) {
        return this.level > other.level;
    }
}
