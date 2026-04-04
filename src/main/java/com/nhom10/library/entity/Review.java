package com.nhom10.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Đánh giá / Bình luận sách (Review).
 *
 * Ràng buộc nghiệp vụ:
 *  - 1 user chỉ được review 1 lần / 1 cuốn sách
 *    → Enforce bằng unique constraint ở DB + check trong ReviewService.
 *  - rating: 1–5 sao (validate tại Entity layer bằng @Min/@Max).
 *
 * Soft Delete: xóa review không ảnh hưởng Book hay User.
 */
@Entity
@Table(
    name = "reviews",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_reviews_user_book",
        columnNames = {"user_id", "book_id"}
    )
)
@SQLDelete(sql = "UPDATE reviews SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "book"})
public class Review extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    /**
     * Số sao đánh giá: 1 (tệ) → 5 (xuất sắc).
     * @Min/@Max validate ở bean validation layer (khi nhận từ request DTO),
     * @Column check constraint tại DB level (tùy DBMS hỗ trợ).
     */
    @Min(1)
    @Max(5)
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
}
