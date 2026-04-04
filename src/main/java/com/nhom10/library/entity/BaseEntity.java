package com.nhom10.library.entity;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Base entity chứa các field chung:
 * - id: PK dùng IDENTITY (auto_increment MySQL)
 * - createdAt / updatedAt: tự động cập nhật qua JPA Auditing (@EnableJpaAuditing)
 * - deleted: cờ soft-delete
 *
 * equals/hashCode dựa trên id (null-safe) — best practice cho JPA entity:
 *   - hashCode() luôn trả về constant → đảm bảo entity hoạt động đúng trong Set/Map
 *     trước và sau khi persist (id lúc đầu là null).
 *   - equals() so sánh id, nếu id null thì chỉ bằng chính nó (reference equality).
 */
@MappedSuperclass
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Cờ soft-delete.
     * - Default = false (chưa bị xóa)
     * - @SQLDelete ở từng entity sẽ UPDATE deleted=1 thay vì DELETE thực sự
     * - @SQLRestriction("deleted = 0") ở từng entity tự động lọc ra khỏi query
     */
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;
}
