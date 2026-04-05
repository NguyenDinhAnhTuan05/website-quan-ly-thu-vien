package com.nhom10.library.service;

import com.nhom10.library.dto.request.BorrowRequest;
import com.nhom10.library.dto.response.BorrowRecordResponse;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.BorrowDetail;
import com.nhom10.library.entity.BorrowRecord;
import com.nhom10.library.entity.User;
import com.nhom10.library.entity.UserSubscription;
import com.nhom10.library.entity.enums.BorrowStatus;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.BookNotAvailableException;
import com.nhom10.library.exception.ForbiddenException;
import com.nhom10.library.exception.InvalidBorrowStatusException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.BorrowRecordRepository;
import com.nhom10.library.repository.UserRepository;
import com.nhom10.library.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

import org.springframework.cache.CacheManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final CacheManager cacheManager;

    /** Giới hạn mượn mặc định (gói BASIC, không có subscription) */
    private static final int MAX_ACTIVE_BORROWS = 3;
    /** Điểm thưởng khi trả sách đúng hạn */
    private static final int POINTS_ON_RETURN = 10;
    /** Điểm phạt khi trả sách trễ (OVERDUE) — điểm không thể xuống dưới 0 */
    private static final int POINTS_PENALTY_OVERDUE = 5;
    /** Hạn mượn mặc định: 14 ngày */
    private static final int DEFAULT_BORROW_DAYS = 14;

    // ================================================================
    // USER ACTIONS
    // ================================================================

    /**
     * User tạo yêu cầu mượn sách.
     *
     * Ràng buộc nghiệp vụ:
     *   1. Không có phiếu OVERDUE chưa giải quyết.
     *   2. Số phiếu PENDING + BORROWING không vượt quá MAX_ACTIVE_BORROWS.
     *   3. Danh sách bookIds không được có ID trùng lặp.
     *   4. Mỗi cuốn sách phải còn bản để mượn (available + availableQuantity > 0).
     *
     * Dùng @Transactional: Rollback TOÀN BỘ nếu bất kỳ sách nào hết bản.
     * Pessimistic Lock trên Book để tránh race condition.
     */
    @Transactional
    public BorrowRecordResponse createBorrowRequest(Long userId, BorrowRequest request) {
        List<Long> bookIds = request.getBookIds();

        // 1. Kiểm tra book IDs không trùng lặp
        if (new HashSet<>(bookIds).size() < bookIds.size()) {
            throw new BadRequestException("Danh sách sách chứa ID trùng lặp. Mỗi cuốn sách chỉ được thêm một lần.");
        }

        // 2. Kiểm tra không có phiếu OVERDUE
        long overdueCount = borrowRecordRepository.countOverdueByUserId(userId);
        if (overdueCount > 0) {
            throw new BadRequestException(
                "Bạn có " + overdueCount + " phiếu mượn quá hạn chưa trả. "
                + "Vui lòng trả sách trước khi mượn thêm."
            );
        }

        // 3. Kiểm tra số phiếu đang hoạt động (giới hạn theo subscription plan)
        int maxBorrows = userSubscriptionRepository
            .findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
            .stream()
            .findFirst()
            .map(s -> s.getPlan().getMaxBorrowBooks())
            .orElse(MAX_ACTIVE_BORROWS);

        long activeBorrows = borrowRecordRepository.countByUserIdAndStatusIn(
            userId, List.of(BorrowStatus.PENDING, BorrowStatus.BORROWING)
        );
        if (activeBorrows >= maxBorrows) {
            throw new BadRequestException(
                "Bạn đã đạt giới hạn " + maxBorrows + " phiếu mượn/chờ duyệt. "
                + "Vui lòng trả sách để tạo phiếu mới."
            );
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        BorrowRecord record = BorrowRecord.builder()
            .user(user)
            .status(BorrowStatus.PENDING)
            .note(request.getNote())
            .build();

        // 4. Validate + Giảm số lượng sách + Lưu snapshot
        for (Long bookId : bookIds) {
            Book book = bookRepository.findByIdWithLock(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

            if (!book.isAvailableForBorrow()) {
                throw new BookNotAvailableException(book.getTitle());
            }

            book.decreaseAvailableQuantity();
            bookRepository.save(book);
            evictBookCache(book.getId());

            BorrowDetail detail = BorrowDetail.builder()
                .book(book)
                .snapshotTitle(book.getTitle())         // Lưu snapshot để bảo toàn lịch sử
                .snapshotCoverUrl(book.getCoverUrl())
                .snapshotIsbn(book.getIsbn())
                .build();
            record.addDetail(detail);
        }

        BorrowRecord savedRecord = borrowRecordRepository.save(record);
        log.info("User {} tạo phiếu mượn {} với {} cuốn sách", userId, savedRecord.getId(), bookIds.size());
        return BorrowRecordResponse.from(savedRecord);
    }

    @Transactional(readOnly = true)
    public Page<BorrowRecordResponse> getMyBorrowHistory(Long userId, Pageable pageable) {
        return borrowRecordRepository.findByUserId(userId, pageable)
            .map(BorrowRecordResponse::from);
    }

    /**
     * User tự hủy phiếu mượn của mình khi còn đang PENDING.
     *
     * Ràng buộc:
     *   - Chỉ hủy được khi trạng thái là PENDING (chưa được duyệt).
     *   - Chỉ người tạo phiếu mới được hủy (chủ phiếu mượn).
     *   - Phục hồi available_quantity của từng cuốn sách sau khi hủy.
     */
    @Transactional
    public BorrowRecordResponse cancelBorrowRequest(Long userId, Long recordId) {
        BorrowRecord record = borrowRecordRepository.findByIdWithDetails(recordId)
            .orElseThrow(() -> new ResourceNotFoundException("BorrowRecord", "id", recordId));

        // Kiểm tra quyền sở hữu: chỉ chủ phiếu mới được hủy
        if (!record.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền hủy phiếu mượn này.");
        }

        // Chỉ hủy được khi đang PENDING
        if (record.getStatus() != BorrowStatus.PENDING) {
            throw new InvalidBorrowStatusException(
                "Chỉ có thể hủy phiếu đang ở trạng thái PENDING. "
                + "Phiếu này hiện đang ở trạng thái " + record.getStatus() + "."
            );
        }

        record.setStatus(BorrowStatus.CANCELLED);
        restoreBorrowedBooks(record);

        BorrowRecord saved = borrowRecordRepository.save(record);
        log.info("User {} đã hủy phiếu mượn {}", userId, recordId);
        return BorrowRecordResponse.from(saved);
    }

    // ================================================================
    // ADMIN ACTIONS
    // ================================================================

    /** Admin duyệt phiếu mượn — bắt đầu tính thời hạn */
    @Transactional
    public BorrowRecordResponse approveBorrow(Long adminId, Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
            .orElseThrow(() -> new ResourceNotFoundException("BorrowRecord", "id", recordId));

        if (record.getStatus() != BorrowStatus.PENDING) {
            throw new InvalidBorrowStatusException("Chỉ có thể duyệt phiếu đang ở trạng thái PENDING.");
        }

        record.setStatus(BorrowStatus.BORROWING);
        record.setBorrowDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(DEFAULT_BORROW_DAYS));

        BorrowRecord savedRecord = borrowRecordRepository.save(record);
        log.info("Admin {} đã duyệt phiếu mượn {}", adminId, recordId);
        return BorrowRecordResponse.from(savedRecord);
    }

    /**
     * Admin từ chối phiếu mượn — chỉ khi còn PENDING.
     *
     * Ràng buộc:
     *   - Chỉ từ chối được khi trạng thái PENDING.
     *   - Phục hồi available_quantity của từng cuốn sách.
     *
     * @param adminId  ID admin thực hiện thao tác (dùng để audit log).
     * @param recordId ID phiếu mượn cần từ chối.
     * @param reason   Lý do từ chối (ghi vào note).
     */
    @Transactional
    public BorrowRecordResponse rejectBorrow(Long adminId, Long recordId, String reason) {
        BorrowRecord record = borrowRecordRepository.findByIdWithDetails(recordId)
            .orElseThrow(() -> new ResourceNotFoundException("BorrowRecord", "id", recordId));

        if (record.getStatus() != BorrowStatus.PENDING) {
            throw new InvalidBorrowStatusException(
                "Chỉ có thể từ chối phiếu đang ở trạng thái PENDING. "
                + "Phiếu này hiện đang ở trạng thái " + record.getStatus() + "."
            );
        }

        record.setStatus(BorrowStatus.REJECTED);
        if (reason != null && !reason.isBlank()) {
            record.setNote("Từ chối: " + reason);
        }
        restoreBorrowedBooks(record);

        BorrowRecord saved = borrowRecordRepository.save(record);
        log.info("Admin {} đã từ chối phiếu mượn {} với lý do: {}", adminId, recordId, reason);
        return BorrowRecordResponse.from(saved);
    }

    /**
     * Admin xác nhận trả sách — hoàn lại số lượng sách vào kho.
     * Cần EntityGraph/JOIN FETCH sách (findByIdWithDetails) để update được.
     */
    @Transactional
    public BorrowRecordResponse returnBooks(Long adminId, Long recordId) {
        BorrowRecord record = borrowRecordRepository.findByIdWithDetails(recordId)
            .orElseThrow(() -> new ResourceNotFoundException("BorrowRecord", "id", recordId));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new InvalidBorrowStatusException("Phiếu này đã được trả trước đó.");
        }
        if (record.getStatus() == BorrowStatus.PENDING) {
            throw new InvalidBorrowStatusException("Phiếu chưa được duyệt, không thể trả.");
        }
        if (record.getStatus() == BorrowStatus.CANCELLED || record.getStatus() == BorrowStatus.REJECTED) {
            throw new InvalidBorrowStatusException("Phiếu đã bị hủy/từ chối, không thể xử lý trả.");
        }

        boolean wasOverdue = record.getStatus() == BorrowStatus.OVERDUE;

        record.setStatus(BorrowStatus.RETURNED);
        record.setReturnDate(LocalDate.now());

        restoreBorrowedBooks(record);

        // Gamification: thưởng/phạt điểm tùy theo trả đúng hạn hay trễ
        User borrower = record.getUser();
        if (wasOverdue) {
            // Trả trễ: trừ điểm phạt, không để điểm âm
            int newPoints = Math.max(0, borrower.getPoints() - POINTS_PENALTY_OVERDUE);
            borrower.setPoints(newPoints);
            userRepository.save(borrower);
            log.info("Admin {} đã nhận trả TRỄ phiếu mượn {}. User {} bị -{} điểm phạt (tổng: {})",
                adminId, recordId, borrower.getId(), POINTS_PENALTY_OVERDUE, borrower.getPoints());
        } else {
            // Trả đúng hạn: cộng điểm thưởng
            borrower.setPoints(borrower.getPoints() + POINTS_ON_RETURN);
            userRepository.save(borrower);
            log.info("Admin {} đã nhận trả đúng hạn phiếu mượn {}. User {} được +{} điểm (tổng: {})",
                adminId, recordId, borrower.getId(), POINTS_ON_RETURN, borrower.getPoints());
        }

        BorrowRecord savedRecord = borrowRecordRepository.save(record);
        return BorrowRecordResponse.from(savedRecord);
    }

    /** Admin lấy toàn bộ danh sách phiếu mượn, có thể lọc theo status */
    @Transactional(readOnly = true)
    public Page<BorrowRecordResponse> getAllBorrows(BorrowStatus status, Pageable pageable) {
        if (status != null) {
            return borrowRecordRepository.findByStatus(status, pageable)
                .map(BorrowRecordResponse::from);
        }
        return borrowRecordRepository.findAll(pageable)
            .map(BorrowRecordResponse::from);
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    /**
     * Phục hồi available_quantity cho tất cả sách trong phiếu mượn.
     * Dùng khi hủy (CANCELLED) hoặc từ chối (REJECTED) hoặc trả (RETURNED).
     *
     * Xử lý an toàn khi sách đã bị soft-delete:
     *   - Nếu book == null (bị xóa): bỏ qua, quantity không cần phục hồi
     *     vì sách đó đã không còn trong hệ thống.
     *   - Nếu book còn tồn tại: tăng availableQuantity, giới hạn tại quantity.
     */
    private void restoreBorrowedBooks(BorrowRecord record) {
        for (BorrowDetail detail : record.getDetails()) {
            Book book = detail.getBook();
            if (book != null) {
                // Cap an toàn: không tăng quá total quantity
                int newAvail = Math.min(book.getAvailableQuantity() + 1, book.getQuantity());
                book.setAvailableQuantity(newAvail);
                bookRepository.save(book);
                evictBookCache(book.getId());
            }
        }
    }

    /** Xóa cache thủ công cho cuốn sách vừa thay đổi số lượng (tránh Stale Cache) */
    private void evictBookCache(Long bookId) {
        if (cacheManager != null) {
            org.springframework.cache.Cache cache = cacheManager.getCache("books");
            if (cache != null) {
                cache.evict(bookId);
            }
        }
    }
}
