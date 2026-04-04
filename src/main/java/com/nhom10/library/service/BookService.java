package com.nhom10.library.service;

import com.nhom10.library.dto.request.BookSearchRequest;
import com.nhom10.library.dto.response.BookResponse;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import com.nhom10.library.exception.ForbiddenException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.UserSubscriptionRepository;
import com.nhom10.library.specification.BookSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
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
    private final UserSubscriptionRepository userSubscriptionRepository;

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
     * Đọc nội dung sách — YÊU CẦU ĐĂNG NHẬP + KIỂM TRA SUBSCRIPTION.
     *
     * Logic:
     *   1. Nếu sách có content/ebookUrl → đây là Ebook trả phí.
     *   2. User phải có gói subscription ACTIVE (PREMIUM) mới được đọc.
     *   3. Trả về full BookResponse bao gồm content.
     */
    @Transactional(readOnly = true)
    public BookResponse readBookContent(Long userId, Long bookId) {
        Book book = bookRepository.findByIdWithDetails(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        // Nếu sách có nội dung ebook, kiểm tra subscription
        boolean hasEbookContent = (book.getContent() != null && !book.getContent().isBlank())
                               || (book.getEbookUrl() != null && !book.getEbookUrl().isBlank());

        if (hasEbookContent) {
            boolean hasActiveSubscription = userSubscriptionRepository
                .findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
                .stream()
                .findFirst()
                .isPresent();

            if (!hasActiveSubscription) {
                throw new ForbiddenException(
                    "Bạn cần đăng ký gói Premium để đọc nội dung sách này. "
                    + "Vui lòng nâng cấp tài khoản."
                );
            }
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
