package com.nhom10.library.service;

import com.nhom10.library.dto.response.GoogleBooksResponse;
import com.nhom10.library.entity.Author;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.Category;
import com.nhom10.library.repository.AuthorRepository;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service tích hợp ngoài: Tự động tải (Crawl) dữ liệu sách từ API của Google.
 * Điểm ăn tiền ở môn học: Scheduling Crawler - Automation - Data Pipeline.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleBooksCrawlerService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;

    private static final String GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=40";
    
    // Tái sử dụng RestTemplate đơn lẻ (không cần Bean riêng vì đơn giản)
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Tự động crawl sách mới mỗi đêm lúc 2:00 AM.
     * Dùng cron expression: "s m h d M dw"
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void scheduledDailyCrawl() {
        log.info("==> [CronJob] Bắt đầu tự động cào dữ liệu Google Books lúc 2:00 AM...");
        String[] keywords = {"programming", "health", "history", "novel", "science", "business"};
        
        // Random 1 từ khóa ngẫu nhiên mỗi ngày để từ từ thu thập sách đa dạng
        String randomDomain = keywords[(int) (Math.random() * keywords.length)];
        crawlData(randomDomain);
        log.info("==> [CronJob] Cào dữ liệu hoàn tất cho chủ đề '{}'!", randomDomain);
    }

    /**
     * Hàm Crawl chính trả về số sách thêm thành công.
     * Admin/Controller có thể gọi trực tiếp tham số tùy ý.
     */
    @Transactional
    public int crawlData(String query) {
        log.info("Đang gọi Google Books API với từ khóa: '{}'...", query);
        int newBooksCount = 0;
        try {
            // Gửi HTTP GET request
            GoogleBooksResponse response = restTemplate.getForObject(
                GOOGLE_BOOKS_API_URL, 
                GoogleBooksResponse.class, 
                query
            );
            
            if (response != null && response.getItems() != null) {
                for (GoogleBooksResponse.Item item : response.getItems()) {
                    // Xử lý từng cuốn sách
                    if (processBookItem(item)) {
                        newBooksCount++;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi kết nối tới Google Books API: {}", e.getMessage());
        }
        
        log.info("Hoàn tất! Đã thêm cài đặt {} đầu sách mới vào Thư Viện.", newBooksCount);
        return newBooksCount;
    }

    /**
     * Map dữ liệu JSON vào Database. Nếu trùng ISBN thì bỏ qua.
     */
    private boolean processBookItem(GoogleBooksResponse.Item item) {
        try {
            GoogleBooksResponse.VolumeInfo info = item.getVolumeInfo();
            // Bỏ qua nếu thiếu thông tin tối thiểu
            if (info == null || info.getTitle() == null) {
                return false;
            }

            // 1. Kiểm tra mã ISBN (Nếu không có, fallback qua Google ID)
            String isbn = extractIsbn(info.getIndustryIdentifiers());
            if (isbn == null || isbn.isBlank()) {
                isbn = item.getId();
            }

            // Đảm bảo unique, không sửa sách cũ để bảo vệ database (tránh ghi đè admin đang chỉnh)
            if (bookRepository.existsByIsbn(isbn)) {
                return false; 
            }

            // 2. Map Categories (Tự thêm vào bảng categories nếu chưa tồn tại)
            Set<Category> categories = new HashSet<>();
            if (info.getCategories() != null) {
                for (String catName : info.getCategories()) {
                    Category cat = categoryRepository.findByName(catName)
                        .orElseGet(() -> categoryRepository.save(Category.builder().name(catName).build()));
                    categories.add(cat);
                }
            }

            // 3. Map Authors (Tự thêm vào bảng authors nếu chưa tồn tại)
            Set<Author> authors = new HashSet<>();
            if (info.getAuthors() != null) {
                for (String authorName : info.getAuthors()) {
                    Author author = authorRepository.findByName(authorName)
                        .orElseGet(() -> authorRepository.save(Author.builder().name(authorName).build()));
                    authors.add(author);
                }
            }

            // 4. Map hình ảnh (Nếu HTTP thì ép thành HTTPS để an toàn TLS)
            String coverUrl = null;
            if (info.getImageLinks() != null) {
                coverUrl = info.getImageLinks().getThumbnail();
                if (coverUrl != null && coverUrl.startsWith("http:")) {
                    coverUrl = coverUrl.replace("http:", "https:");
                }
            }

            // 5. Build Sách (Mặc định cho vào kho với số lượng 10 bản)
            Book book = Book.builder()
                .title(truncate(info.getTitle(), 255))
                .isbn(truncate(isbn, 20)) // Không để vượt len DB column
                .description(info.getDescription())
                .coverUrl(coverUrl)
                .quantity(10) 
                .availableQuantity(10)
                .available(true)
                .publishedDate(parseDateString(info.getPublishedDate()))
                .categories(categories)
                .authors(authors)
                .build();

            // Insert Book (Với đầy đủ Relation JoinTable Categories, Authors)
            bookRepository.save(book);
            return true;
            
        } catch (Exception ex) {
            log.warn("Lỗi khi xử lý cuốn sách API ID '{}': {}", item.getId(), ex.getMessage());
            return false;
        }
    }

    /** Xử lý logic bóc tách ISBN (Ưu tiên ISBN 13) */
    private String extractIsbn(List<GoogleBooksResponse.IndustryIdentifier> identifiers) {
        if (identifiers == null) return null;
        
        String isbn10 = null;
        for (GoogleBooksResponse.IndustryIdentifier id : identifiers) {
            if ("ISBN_13".equals(id.getType())) {
                return id.getIdentifier(); // Lấy luôn mã chuẩn quốc tế mới nhất
            } else if ("ISBN_10".equals(id.getType())) {
                isbn10 = id.getIdentifier(); // Để dành dự phòng nếu không có ISBN_13
            }
        }
        return isbn10;
    }

    /** Cắt chuỗi nếu API trả về String quá dài, chống lỗi tràn giới hạn cột SQL */
    private String truncate(String text, int maxLength) {
        if (text == null) return null;
        return text.length() > maxLength ? text.substring(0, maxLength) : text;
    }

    /** Parser an toàn các chuỗi thời gian không đồng nhất từ API (chỉ có Năm, hoặc đúng dd/mm) */
    private LocalDate parseDateString(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            if (dateStr.length() == 4) {
                return LocalDate.of(Integer.parseInt(dateStr), 1, 1);
            } else if (dateStr.length() == 7) {
                return LocalDate.parse(dateStr + "-01");
            }
            return LocalDate.parse(dateStr);
        } catch (Exception ignored) {
            return null;
        }
    }
}
