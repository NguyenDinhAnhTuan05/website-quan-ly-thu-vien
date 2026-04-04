package com.nhom10.library.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Thể loại sách (Category).
 * Quan hệ với Book là ManyToMany — INVERSE side (mappedBy ở Book).
 *
 * Soft Delete: @SQLDelete + @SQLRestriction
 * → Khi xóa Category, các Book thuộc thể loại đó KHÔNG bị ảnh hưởng.
 *   Book chỉ mất liên kết với Category này.
 */
@Entity
@Table(
    name = "categories",
    uniqueConstraints = @UniqueConstraint(name = "uk_categories_name", columnNames = "name")
)
@SQLDelete(sql = "UPDATE categories SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "books")
public class Category extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * INVERSE side của quan hệ Book <-> Category.
     * Không có @JoinTable ở đây → Book là OWNING side.
     * Không map ngược về Book thì bỏ field này, tùy nhu cầu.
     */
    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    private java.util.Set<Book> books = new java.util.HashSet<>();
}
