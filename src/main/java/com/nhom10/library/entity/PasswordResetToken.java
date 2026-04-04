package com.nhom10.library.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * Token reset mật khẩu (PasswordResetToken).
 *
 * Flow:
 *  1. User yêu cầu quên mật khẩu → tạo token (UUID), gửi link qua email.
 *  2. User click link → validate token (tồn tại, chưa used, chưa hết hạn).
 *  3. User đặt mật khẩu mới → đánh dấu used = true.
 *
 * Bảo mật:
 *  - Token là UUID ngẫu nhiên (đủ entropy, không đoán được).
 *  - expiresAt: 15 phút (cấu hình trong application.yml).
 *  - used: ngăn dùng lại token đã sử dụng (replay attack).
 *  - Mỗi lần request mới → vô hiệu hóa token cũ (xử lý trong Service).
 *
 * Soft Delete: consistent với các entity khác.
 *  → Có thể dùng @Scheduled để hard-delete các token hết hạn định kỳ.
 */
@Entity
@Table(
    name = "password_reset_tokens",
    uniqueConstraints = @UniqueConstraint(name = "uk_prt_token", columnNames = "token")
)
@SQLDelete(sql = "UPDATE password_reset_tokens SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
public class PasswordResetToken extends BaseEntity {

    /**
     * OWNING side — ManyToOne với User.
     * Một user có thể có nhiều token theo thời gian
     * (mỗi lần request tạo token mới, token cũ bị đánh dấu deleted/used).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** UUID token gửi trong link email */
    @Column(name = "token", nullable = false, length = 255)
    private String token;

    /** Thời điểm hết hạn — mặc định 15 phút kể từ khi tạo */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** Đã sử dụng chưa — ngăn replay attack */
    @Column(name = "used", nullable = false)
    @Builder.Default
    private boolean used = false;

    // ================================================================
    // HELPER METHODS
    // ================================================================

    /** Kiểm tra token còn hợp lệ không */
    public boolean isValid() {
        return !used && LocalDateTime.now().isBefore(expiresAt);
    }

    /** Vô hiệu hóa token */
    public void markAsUsed() {
        this.used = true;
    }
}
