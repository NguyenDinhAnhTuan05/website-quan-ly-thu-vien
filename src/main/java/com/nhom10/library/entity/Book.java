package com.nhom10.library.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity Sách (Book) — trung tâm của hệ thống.
 *
 * ManyToMany với Category và Author:
 *  - Book là OWNING side (có @JoinTable) → Book chịu trách nhiệm quản lý
 *    bảng join book_category và book_author.
 *  - Dùng Set (không dùng List) cho @ManyToMany:
 *      + List → Hibernate dùng "bag" → xóa hết rồi insert lại khi update → chậm.
 *      + Set → Hibernate diff và chỉ xóa/thêm dòng cần thiết → hiệu quả hơn.
 *
 * Số lượng:
 *  - quantity: tổng số bản vật lý của sách.
 *  - availableQuantity: số bản còn lại (được cập nhật trong BorrowService).
 *  - available: admin bật/tắt thủ công (ví dụ: sách đang bảo trì).
 *
 * Soft Delete: @SQLDelete + @SQLRestriction
 *  → Xóa Book không ảnh hưởng BorrowRecord/Review cũ (chỉ ẩn khỏi query).
 */
@Entity
@Table(
    name = "books",
    uniqueConstraints = @UniqueConstraint(name = "uk_books_isbn", columnNames = "isbn")
)
@SQLDelete(sql = "UPDATE books SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"categories", "authors", "reviews", "borrowDetails"})
public class Book extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    /** ISBN-13 (13 ký tự, không bắt buộc dấu gạch) */
    @Column(name = "isbn", length = 20)
    private String isbn;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id")
    private BookSeries series;

    @Column(name = "series_order")
    @Builder.Default
    private int seriesOrder = 0;

    /** Đường dẫn tới file E-book (PDF/EPUB) để đọc trực tuyến */
    @Column(name = "ebook_url", length = 500)
    private String ebookUrl;

    /** Link đọc thử (thường từ Google Books) */
    @Column(name = "preview_url", length = 500)
    private String previewUrl;

    /** Nội dung sách (HTML) để đọc trực tiếp trên web */
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;

    /** Số trang của sách */
    @Column(name = "page_count")
    @Builder.Default
    private int pageCount = 0;

    /** Ngôn ngữ sách (vi, en...) */
    @Column(name = "language", length = 10)
    @Builder.Default
    private String language = "vi";

    /** Tổng số bản vật lý */
    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private int quantity = 1;

    /**
     * Số bản có thể mượn hiện tại.
     * = quantity - số lượng đang được mượn (status = BORROWING).
     * Cập nhật trong BorrowService, không cập nhật trực tiếp.
     */
    @Column(name = "available_quantity", nullable = false)
    @Builder.Default
    private int availableQuantity = 1;

    /**
     * Admin có thể tắt sách (dù còn bản) → không cho mượn.
     * true = có thể mượn (nếu availableQuantity > 0).
     */
    @Column(name = "available", nullable = false)
    @Builder.Default
    private boolean available = true;

    @Column(name = "published_date")
    private LocalDate publishedDate;

    /**
     * Đếm số thể loại bị xóa (soft-delete) nhưng vẫn còn liên kết với sách này.
     * Dùng để hiển thị "Đà xóa" trong CategoryResponse của sách.
     *
     * @Formula: Hibernate sẽ nhúng subquery vào mọi câu SELECT books,
     *   không nhận tham số, không persist vào DB.
     *   `id` trong SQL này tự động bind vào cột `books.id` của dòng hiện tại.
     */
    @Formula("(SELECT COUNT(*) FROM book_category bc" +
              " INNER JOIN categories c ON bc.category_id = c.id" +
              " WHERE bc.book_id = id AND c.deleted = 1)")
    private long deletedCategoryCount;

    // ================================================================
    // RELATIONSHIPS
    // ================================================================

    /**
     * Book OWNING side — @JoinTable định nghĩa bảng trung gian.
     * FetchType.LAZY — chỉ load khi gọi getCategories().
     *   → Khi cần: dùng JOIN FETCH trong JPQL hoặc @EntityGraph.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "book_category",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    /**
     * Book OWNING side — bảng join book_author.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "book_author",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    @Builder.Default
    private Set<Author> authors = new HashSet<>();

    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.List<Review> reviews = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.List<BorrowDetail> borrowDetails = new java.util.ArrayList<>();

    // ================================================================
    // HELPER METHODS — tiện dùng trong Service
    // ================================================================

    /** Kiểm tra còn bản có thể mượn không */
    public boolean isAvailableForBorrow() {
        return available && availableQuantity > 0;
    }

    /** Giảm số lượng khi mượn — gọi trong BorrowService */
    public void decreaseAvailableQuantity() {
        if (availableQuantity <= 0) {
            throw new IllegalStateException("Sách '" + title + "' không còn bản để mượn.");
        }
        this.availableQuantity--;
    }

    /** Tăng số lượng khi trả — gọi trong BorrowService */
    public void increaseAvailableQuantity() {
        if (availableQuantity >= quantity) {
            throw new IllegalStateException("Số lượng sách '" + title + "' đã đạt tối đa.");
        }
        this.availableQuantity++;
    }
}
