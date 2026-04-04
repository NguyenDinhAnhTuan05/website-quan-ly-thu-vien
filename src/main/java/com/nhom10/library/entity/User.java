package com.nhom10.library.entity;

import com.nhom10.library.entity.enums.AuthProvider;
import com.nhom10.library.entity.enums.MembershipTier;
import com.nhom10.library.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Đại diện cho người dùng trong hệ thống.
 *
 * Soft Delete:
 *  - @SQLDelete: ghi đè SQL DELETE → UPDATE SET deleted=1
 *  - @SQLRestriction: tự động thêm WHERE deleted=0 vào mọi query JPQL/Criteria
 *
 * OAuth2:
 *  - password nullable → user OAuth2 không có password local
 *  - provider + providerId → định danh tài khoản OAuth2
 *
 * Security:
 *  - Không implement UserDetails trực tiếp → tách biệt concern
 *  - UserDetails sẽ được wrap trong UserPrincipal (module Security)
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_users_username", columnNames = "username")
    }
)
@SQLDelete(sql = "UPDATE users SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"borrowRecords", "reviews", "subscriptions"}) // Tránh vòng lặp toString
public class User extends BaseEntity {

    @Column(name = "username", length = 50)
    private String username;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    /**
     * Nullable: user đăng nhập OAuth2 không có password.
     * Luôn store dạng BCrypt hash — KHÔNG lưu plain text.
     */
    @Column(name = "password", length = 255)
    private String password;

    /**
     * ROLE_USER (default) hoặc ROLE_ADMIN.
     * EnumType.STRING: lưu tên enum → dễ đọc, không lỗi khi thêm enum mới.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    /**
     * Admin có thể bật/tắt tài khoản user.
     * enabled=false → không cho phép đăng nhập dù credentials đúng.
     */
    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 20)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    /** ID của user trên hệ thống OAuth2 (Google sub, GitHub id...) */
    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    /** Gamification: Điểm tích lũy của người dùng */
    @Column(name = "points", nullable = false)
    @Builder.Default
    private int points = 0;

    /** Hạng thành viên (Quyết định số sách mượn tối đa và thời gian) */
    @Enumerated(EnumType.STRING)
    @Column(name = "membership_tier", nullable = false, length = 20)
    @Builder.Default
    private MembershipTier membershipTier = MembershipTier.BASIC;

    // ================================================================
    // RELATIONSHIPS — tất cả LAZY để tránh N+1
    // Không dùng CascadeType.ALL → tránh xóa book/review theo user
    // ================================================================

    /**
     * Lịch sử mượn của user.
     * mappedBy = "user" → User là INVERSE side, BorrowRecord là OWNING side.
     * orphanRemoval = false → soft-delete, không xóa thật.
     */
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.List<BorrowRecord> borrowRecords = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.List<Review> reviews = new java.util.ArrayList<>();
    
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.List<UserSubscription> subscriptions = new java.util.ArrayList<>();
}
