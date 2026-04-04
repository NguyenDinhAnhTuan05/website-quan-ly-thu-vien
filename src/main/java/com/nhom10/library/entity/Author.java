package com.nhom10.library.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Tác giả sách (Author).
 * Quan hệ với Book là ManyToMany — INVERSE side (mappedBy ở Book).
 *
 * Soft Delete: xóa Author không ảnh hưởng dữ liệu Book.
 */
@Entity
@Table(name = "authors")
@SQLDelete(sql = "UPDATE authors SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "books")
public class Author extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @ManyToMany(mappedBy = "authors", fetch = FetchType.LAZY)
    private java.util.Set<Book> books = new java.util.HashSet<>();
}
