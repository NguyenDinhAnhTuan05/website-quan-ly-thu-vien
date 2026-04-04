package com.nhom10.library.dto.response;

import com.nhom10.library.entity.BorrowDetail;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.BorrowRecord;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class BorrowRecordResponse {

    private Long id;
    private Long userId;
    private String username;
    private String status;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String note;
    private List<BorrowDetailResponse> details;

    public static BorrowRecordResponse from(BorrowRecord record) {
        return BorrowRecordResponse.builder()
            .id(record.getId())
            .userId(record.getUser().getId())
            .username(record.getUser().getUsername())
            .status(record.getStatus().name())
            .borrowDate(record.getBorrowDate())
            .dueDate(record.getDueDate())
            .returnDate(record.getReturnDate())
            .note(record.getNote())
            .details(record.getDetails().stream()
                .map(BorrowDetailResponse::from)
                .toList())
            .build();
    }

    @Data
    @Builder
    public static class BorrowDetailResponse {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private String bookCoverUrl;
        private String bookIsbn;
        /**
         * true = sách đã bị xóa (soft-delete) sau khi phiếu mượn được tạo.
         * Khi đó bookTitle/bookCoverUrl lấy từ snapshot đã lưu.
         */
        private boolean bookDeleted;

        /**
         * Xử lý trường hợp sách bị xóa (soft-delete) sau khi phiếu mượn được tạo.
         *
         * Vấn đề: @SQLRestriction("deleted = 0") trên Book khiến
         *   detail.getBook() trả về null với sách soft-deleted trong một số context.
         * Giải pháp: đọc từ snapshot fields đã lưu khi tạo phiếu.
         *
         * Ưu tiên: nếu book còn active thì dùng data thực; nếu null thì dùng snapshot.
         */
        public static BorrowDetailResponse from(BorrowDetail detail) {
            Book book = detail.getBook();
            boolean deleted = (book == null);

            return BorrowDetailResponse.builder()
                .id(detail.getId())
                .bookId(deleted ? null : book.getId())
                .bookTitle(deleted ? detail.getSnapshotTitle() : book.getTitle())
                .bookCoverUrl(deleted ? detail.getSnapshotCoverUrl() : book.getCoverUrl())
                .bookIsbn(deleted ? detail.getSnapshotIsbn() : book.getIsbn())
                .bookDeleted(deleted)
                .build();
        }
    }
}
