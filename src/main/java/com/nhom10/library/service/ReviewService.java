package com.nhom10.library.service;

import com.nhom10.library.dto.request.ReviewRequest;
import com.nhom10.library.dto.response.ReviewResponse;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.Review;
import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.BorrowStatus;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ForbiddenException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.BorrowRecordRepository;
import com.nhom10.library.repository.ReviewRepository;
import com.nhom10.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.nhom10.library.event.GamificationEvent;
import com.nhom10.library.entity.enums.PointActionType;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByBookId(Long bookId, Pageable pageable) {
        return reviewRepository.findByBookId(bookId, pageable)
                .map(ReviewResponse::from);
    }

    /**
     * Thêm hoặc cập nhật đánh giá sách.
     *
     * Ràng buộc nghiệp vụ:
     *   - User phải có ít nhất một phiếu mượn cuốn sách này với trạng thái RETURNED.
     *     Lý do: Chỉ người đã thực sự mượn và trả sách mới có đủ cơ sở để đánh giá.
     *   - User chỉ được để lại 1 đánh giá / 1 cuốn sách (cập nhật nếu đã có).
     *
     * @param userId  ID người dùng viết review.
     * @param bookId  ID cuốn sách được review.
     * @param request Nội dung review (rating 1-5, comment).
     */
    @Transactional
    public ReviewResponse addOrUpdateReview(Long userId, Long bookId, ReviewRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        // Kiểm tra user đã mượn cuốn sách này chưa (đang mượn / quá hạn / đã trả)
        long borrowCount = borrowRecordRepository.countByUserAndBookAndStatuses(
            userId, bookId,
            java.util.List.of(BorrowStatus.BORROWING, BorrowStatus.OVERDUE, BorrowStatus.RETURNED)
        );
        if (borrowCount == 0) {
            throw new ForbiddenException(
                "Bạn cần mượn cuốn '" + book.getTitle() + "' trước khi đánh giá."
            );
        }

        // Nếu đã có đánh giá, cập nhật; nếu chưa, tạo mới
        boolean isNewReview = !reviewRepository.findByUserIdAndBookId(userId, bookId).isPresent();
        Review review = reviewRepository.findByUserIdAndBookId(userId, bookId)
            .orElse(Review.builder()
                .user(user)
                .book(book)
                .build());

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);

        // Bắn sự kiện Gamification nếu là review mới
        if (isNewReview) {
            eventPublisher.publishEvent(new GamificationEvent(this, user, 
                PointActionType.REVIEW_BOOK, bookId.toString(), "Đánh giá sách: " + book.getTitle()));
        }

        return ReviewResponse.from(savedReview);
    }

    /**
     * Người dùng xóa đánh giá của chính mình.
     *
     * Ràng buộc:
     *   - Chỉ chủ sở hữu review mới được xóa.
     *
     * @param userId   ID người dùng đang xóa.
     * @param reviewId ID review cần xóa.
     */
    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền xóa đánh giá này.");
        }

        reviewRepository.delete(review);
    }
}
