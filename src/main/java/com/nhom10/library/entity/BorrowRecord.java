package com.nhom10.library.entity;

import com.nhom10.library.entity.enums.BorrowStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Phiếu mượn (BorrowRecord) — Header của mỗi lần mượn sách.
 *
 * Pattern: Header — Detail
 *  - BorrowRecord: thông tin chung (user, ngày tháng, trạng thái)
 *  - BorrowDetail: từng đầu sách trong phiếu mượn đó
 *
 * Cascade:
 *  - CascadeType.ALL + orphanRemoval: khi xóa BorrowRecord → xóa cả Detail.
 *    Nhưng vì dùng soft-delete, thực tế "xóa" = UPDATE deleted=1 ở cả 2 bảng.
 *    → Chỉ cascade PERSIST và MERGE; việc soft-delete Detail gọi riêng trong Service.
 *  - Không dùng CascadeType.REMOVE để tránh xung đột với cơ chế soft-delete.
 *
 * @SQLRestriction: tự động lọc record có deleted=0 trong mọi JPQL query.
 */
@Entity
@Table(name = "borrow_records")
@SQLDelete(sql = "UPDATE borrow_records SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "details"})
public class BorrowRecord extends BaseEntity {

    /**
     * OWNING side: @ManyToOne với @JoinColumn.
     * FetchType.LAZY (override default EAGER của @ManyToOne).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private BorrowStatus status = BorrowStatus.PENDING;

    /** Ngày thủ thư duyệt phiếu mượn */
    @Column(name = "borrow_date")
    private LocalDate borrowDate;

    /** Hạn trả sách */
    @Column(name = "due_date")
    private LocalDate dueDate;

    /** Ngày trả thực tế (null nếu chưa trả) */
    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    /**
     * Danh sách sách trong phiếu mượn.
     * CascadeType.PERSIST: khi save BorrowRecord → tự save các Detail.
     * CascadeType.MERGE: khi update BorrowRecord → tự update các Detail.
     * KHÔNG CascadeType.REMOVE → tránh xung đột với soft-delete.
     */
    @OneToMany(
        mappedBy = "borrowRecord",
        fetch = FetchType.LAZY,
        cascade = {CascadeType.PERSIST, CascadeType.MERGE}
    )
    @Builder.Default
    private List<BorrowDetail> details = new ArrayList<>();

    // ================================================================
    // HELPER METHODS
    // ================================================================

    public void addDetail(BorrowDetail detail) {
        details.add(detail);
        detail.setBorrowRecord(this);
    }

    public boolean isActive() {
        return status == BorrowStatus.PENDING || status == BorrowStatus.BORROWING;
    }

    public boolean isOverdue() {
        return status == BorrowStatus.BORROWING
            && dueDate != null
            && LocalDate.now().isAfter(dueDate);
    }
}
