package com.nhom10.library.service;

import com.nhom10.library.dto.request.BookSearchRequest;
import com.nhom10.library.dto.response.BookResponse;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.BorrowStatus;
import com.nhom10.library.entity.enums.PointActionType;
import com.nhom10.library.event.GamificationEvent;
import com.nhom10.library.exception.ForbiddenException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.BorrowRecordRepository;
import com.nhom10.library.repository.PointTransactionRepository;
import com.nhom10.library.repository.UserRepository;
import com.nhom10.library.specification.BookSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Tìm kiếm và phân trang sách (đa điều kiện).
     * Không cache method này vì có quá nhiều tổ hợp params (page, size, filters).
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> searchBooks(BookSearchRequest request) {
        Sort sort = Sort.by(Sort.Direction.fromString(request.getSortDir()), request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Specification<Book> spec = BookSpecification.buildSpec(
            request.getTitle(),
            request.getCategoryId(),
            request.getAuthorId(),
            request.getAvailable(),
            request.isBorrowableOnly()
        );

        return bookRepository.findAll(spec, pageable).map(BookResponse::from);
    }

    /**
     * Lấy thông tin sách PUBLIC (không bao gồm content/ebookUrl).
     * Cache chi tiết cuốn sách vào Redis (name="books", key=id).
     */
    @Cacheable(value = "books", key = "#id")
    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        log.info("Fetching book {} từ DB (Cache miss)", id);
        Book book = bookRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        return BookResponse.fromPublic(book);
    }

    /**
     * Đọc nội dung sách — cần đăng nhập và đã mượn sách.
     *
     * Logic: User phải có phiếu mượn đã duyệt (BORROWING / OVERDUE / RETURNED)
     * chứa cuốn sách này mới được đọc.
     */
    @Transactional
    public BookResponse readBookContent(Long userId, Long bookId) {
        Book book = bookRepository.findByIdWithDetails(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        long borrowCount = borrowRecordRepository.countByUserAndBookAndStatuses(
            userId, bookId,
            List.of(BorrowStatus.BORROWING, BorrowStatus.OVERDUE, BorrowStatus.RETURNED)
        );

        if (borrowCount == 0) {
            throw new ForbiddenException(
                "Bạn cần mượn sách này trước khi đọc. "
                + "Vui lòng tạo phiếu mượn và chờ admin duyệt."
            );
        }

        // Publish READ_BOOK event only once per user per book
        boolean alreadyRewarded = pointTransactionRepository
            .existsByUserIdAndActionTypeAndReferenceId(userId, PointActionType.READ_BOOK, bookId.toString());

        if (!alreadyRewarded) {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            eventPublisher.publishEvent(new GamificationEvent(
                this, user, PointActionType.READ_BOOK, bookId.toString(), "Đọc sách: " + book.getTitle()));
        }

        return BookResponse.from(book);
    }

    /**
     * Lấy Top sách mượn nhiều nhất.
     * Cache vào Redis (name="popular-books") trong 15 phút.
     */
    @Cacheable(value = "popular-books", key = "'top_' + #limit")
    @Transactional(readOnly = true)
    public List<BookResponse> getPopularBooks(int limit) {
        log.info("Fetching top {} popular books từ DB (Cache miss)", limit);
        return bookRepository.findPopularBooks(limit).stream()
            .map(BookResponse::from)
            .collect(Collectors.toList());
    }
}
