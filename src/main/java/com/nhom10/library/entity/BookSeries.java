package com.nhom10.library.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "book_series",
    uniqueConstraints = @UniqueConstraint(name = "uk_book_series_name", columnNames = "name")
)
@SQLDelete(sql = "UPDATE book_series SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "books")
public class BookSeries extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @OneToMany(mappedBy = "series", fetch = FetchType.LAZY)
    @OrderBy("seriesOrder ASC")
    @Builder.Default
    private List<Book> books = new ArrayList<>();
}
