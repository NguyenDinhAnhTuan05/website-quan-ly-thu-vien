package com.nhom10.library.service;

import com.nhom10.library.entity.Book;
import com.nhom10.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookImportService {

    private final BookRepository bookRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes?q=isbn:";

    /**
     * Tự động lấy thông tin sách từ Google Books API bằng mã ISBN.
     */
    public Book importBookByIsbn(String isbn) {
        String url = GOOGLE_BOOKS_API + isbn;
        log.info("Đang gọi Google Books API cho ISBN: {}", isbn);

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("items")) {
                List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
                Map<String, Object> volumeInfo = (Map<String, Object>) items.get(0).get("volumeInfo");

                String title = (String) volumeInfo.get("title");
                String description = (String) volumeInfo.get("description");
                String language = (String) volumeInfo.get("language");
                int pageCount = volumeInfo.containsKey("pageCount") ? (int) volumeInfo.get("pageCount") : 0;
                String previewUrl = (String) volumeInfo.get("previewLink");

                // Lấy ảnh bìa chất lượng cao nhất có thể
                Map<String, String> imageLinks = (Map<String, String>) volumeInfo.get("imageLinks");
                String coverUrl = imageLinks != null ? imageLinks.get("thumbnail") : null;

                Book book = Book.builder()
                        .title(title)
                        .isbn(isbn)
                        .description(description)
                        .coverUrl(coverUrl)
                        .previewUrl(previewUrl)
                        .pageCount(pageCount)
                        .language(language)
                        .quantity(1)
                        .availableQuantity(1)
                        .available(true)
                        .build();

                log.info("Đã tìm thấy sách: {}", title);
                return bookRepository.save(book);
            }
        } catch (Exception e) {
            log.error("Lỗi khi import sách từ Google Books: {}", e.getMessage());
        }
        return null;
    }
}
