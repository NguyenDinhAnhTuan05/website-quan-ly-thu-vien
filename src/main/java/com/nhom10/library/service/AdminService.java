package com.nhom10.library.service;

import com.nhom10.library.dto.request.AdminBookRequest;
import com.nhom10.library.dto.response.BookResponse;
import com.nhom10.library.entity.Author;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.Category;
import com.nhom10.library.entity.enums.BorrowStatus;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.AuthorRepository;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.BorrowRecordRepository;
import com.nhom10.library.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    @Transactional
    public BookResponse createBook(AdminBookRequest request) {
        if (request.getIsbn() != null && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BadRequestException("Mã ISBN '" + request.getIsbn() + "' đã tồn tại.");
        }

        Book book = Book.builder()
            .title(request.getTitle())
            .isbn(request.getIsbn())
            .description(request.getDescription())
            .coverUrl(request.getCoverUrl())
            .quantity(request.getQuantity())
            .availableQuantity(request.getQuantity()) // Mới tạo: available tính = tổng cuốn
            .available(request.isAvailable())
            .publishedDate(request.getPublishedDate())
            .build();

        assignRelations(book, request.getCategoryIds(), request.getAuthorIds());

        Book savedBook = bookRepository.save(book);
        return BookResponse.from(savedBook);
    }

    /**
     * @CachePut cập nhật cache "books" khi sửa chi tiết sách
     */
    @CachePut(value = "books", key = "#id")
    @Transactional
    public BookResponse updateBook(Long id, AdminBookRequest request) {
        Book book = bookRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        if (request.getIsbn() != null && !request.getIsbn().equals(book.getIsbn()) 
                && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BadRequestException("Mã ISBN '" + request.getIsbn() + "' đã tồn tại cho một cuốn sách khác.");
        }

        int diffQuantity = request.getQuantity() - book.getQuantity();
        int newAvailableQuantity = book.getAvailableQuantity() + diffQuantity;

        if (newAvailableQuantity < 0) {
            throw new BadRequestException("Không thể giảm tổng số lượng vì số lượng sách đang cho mượn vượt quá con số bạn muốn giảm.");
        }

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setDescription(request.getDescription());
        book.setCoverUrl(request.getCoverUrl());
        book.setQuantity(request.getQuantity());
        book.setAvailableQuantity(newAvailableQuantity); // Sync update
        book.setAvailable(request.isAvailable());
        book.setPublishedDate(request.getPublishedDate());

        assignRelations(book, request.getCategoryIds(), request.getAuthorIds());
        
        Book updated = bookRepository.save(book);
        log.info("Cập nhật sách thành công: ID = {}", updated.getId());
        return BookResponse.from(updated);
    }

    /**
     * Xóa mềm sách.
     *
     * Ràng buộc nghiệp vụ:
     *   - Không được xóa nếu có phiếu mượn đang hoạt động (PENDING/BORROWING).
     *     Lý do: phiếu mượn đang xử lý có thể cần book để hoàn trả, duyệt, v.v.
     *   - Sau khi xóa mềm, lịch sử mượn cũ vẫn hiển thị tên sách nhờ snapshot fields.
     *
     * @CacheEvict xoá sách này khỏi cache Redis khi thao tác DELETE.
     */
    @CacheEvict(value = "books", key = "#id")
    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        // Ràng buộc: không xóa sách đang có phiếu mượn PENDING hoặc BORROWING
        long activeBorrows = borrowRecordRepository.countActiveBorrowsByBookId(
            id, List.of(BorrowStatus.PENDING, BorrowStatus.BORROWING)
        );
        if (activeBorrows > 0) {
            throw new BadRequestException(
                "Không thể xóa sách '" + book.getTitle() + "' vì hiện có "
                + activeBorrows + " phiếu mượn đang được xử lý."
                + " Vui lòng hoàn tất hoặc từ chối các phiếu mượn trước."
            );
        }

        bookRepository.delete(book);
        log.info("Xóa (soft) sách thành công: ID={}, title='{}'", id, book.getTitle());
    }

    private void assignRelations(Book book, Set<Long> categoryIds, Set<Long> authorIds) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(categoryIds);
            book.setCategories(new HashSet<>(categories));
        }

        if (authorIds != null && !authorIds.isEmpty()) {
            List<Author> authors = authorRepository.findAllById(authorIds);
            book.setAuthors(new HashSet<>(authors));
        }
    }

    // ================================================================
    // GET ALL — Tìm kiếm sách dành cho Admin (bao gồm sách bị tắt)
    // ================================================================

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BookResponse> getAllBooks(
            String keyword,
            org.springframework.data.domain.Pageable pageable) {
        // Two-query approach to avoid HHH90003004 (in-memory pagination)
        // 1) Get paginated IDs at DB level
        org.springframework.data.domain.Page<Long> idPage =
            bookRepository.findAllIdsByKeyword(keyword, pageable);

        if (idPage.isEmpty()) {
            return idPage.map(id -> null); // empty page preserving metadata
        }

        // 2) Fetch full entities with collections using IN clause (no pagination)
        List<Book> books = bookRepository.findAllWithDetailsByIds(idPage.getContent());

        // Preserve the original page order
        Map<Long, Book> bookMap = books.stream()
            .collect(Collectors.toMap(Book::getId, Function.identity()));
        List<BookResponse> ordered = idPage.getContent().stream()
            .map(bookMap::get)
            .map(BookResponse::from)
            .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(ordered, pageable, idPage.getTotalElements());
    }

    // ================================================================
    // TOGGLE STATUS — Bật/Tắt trạng thái available của sách
    // ================================================================

    @CachePut(value = "books", key = "#id")
    @Transactional
    public BookResponse toggleBookStatus(Long id) {
        Book book = bookRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        book.setAvailable(!book.isAvailable());
        Book saved = bookRepository.save(book);
        log.info("Thay đổi trạng thái sách ID={} → available={}", id, saved.isAvailable());
        return BookResponse.from(saved);
    }

    // ================================================================
    // UPDATE CONTENT — Cập nhật nội dung sách (HTML)
    // ================================================================

    @CachePut(value = "books", key = "#id")
    @Transactional
    public BookResponse updateBookContent(Long id, String content) {
        Book book = bookRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        book.setContent(content);
        Book saved = bookRepository.save(book);
        log.info("Cập nhật nội dung sách thành công: ID={}", id);
        return BookResponse.from(saved);
    }
}
