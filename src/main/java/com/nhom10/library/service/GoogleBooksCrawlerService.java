package com.nhom10.library.service;

import com.nhom10.library.dto.response.GoogleBooksResponse;
import com.nhom10.library.entity.Author;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.BookSeries;
import com.nhom10.library.entity.Category;
import com.nhom10.library.repository.AuthorRepository;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.BookSeriesRepository;
import com.nhom10.library.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service tích hợp ngoài: Tự động tải (Crawl) dữ liệu sách từ API của Google.
 * Tự động phát hiện Series từ tên sách, lưu cover_url và author avatar.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleBooksCrawlerService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final BookSeriesRepository bookSeriesRepository;

    private static final String GOOGLE_BOOKS_API_URL =
            "https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=40";
    private static final String OPEN_LIBRARY_AUTHOR_SEARCH =
            "https://openlibrary.org/search/authors.json?q={name}&limit=1";

    private final RestTemplate restTemplate = new RestTemplate();

    // Regex để tách series từ title
    // Matches: "Title, Vol. 1", "Title Volume 2", "Title #3", "Title Book 4",
    //          "Title Part 5", "Title Tập 6", "Title - Tập 7"
    private static final Pattern SERIES_PATTERN = Pattern.compile(
            "^(.+?)(?:\\s*[,:\\-–]\\s*|\\s+)" +
            "(?:Vol\\.?|Volume|Book|Part|#|No\\.?|Tập|Quyển|Phần)" +
            "\\s*(\\d+)(?:\\s*\\)?)?$",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    // Pattern cho title có số ở cuối: "Doraemon 1", "One Piece 45"
    private static final Pattern SERIES_SIMPLE_NUMBER = Pattern.compile(
            "^(.+?)\\s+(\\d{1,4})$"
    );

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void scheduledDailyCrawl() {
        log.info("==> [CronJob] Bắt đầu tự động cào dữ liệu Google Books lúc 2:00 AM...");
        String[] keywords = {"programming", "health", "history", "novel", "science", "business",
                             "manga", "doraemon", "harry potter", "one piece", "naruto"};
        String randomDomain = keywords[(int) (Math.random() * keywords.length)];
        crawlData(randomDomain);
        log.info("==> [CronJob] Cào dữ liệu hoàn tất cho chủ đề '{}'!", randomDomain);
    }

    @Transactional
    public int crawlData(String query) {
        log.info("Đang gọi Google Books API với từ khóa: '{}'...", query);
        int newBooksCount = 0;
        try {
            GoogleBooksResponse response = restTemplate.getForObject(
                GOOGLE_BOOKS_API_URL, GoogleBooksResponse.class, query);
            if (response != null && response.getItems() != null) {
                for (GoogleBooksResponse.Item item : response.getItems()) {
                    if (processBookItem(item)) { newBooksCount++; }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi kết nối tới Google Books API: {}", e.getMessage());
        }
        log.info("Hoàn tất! Đã thêm {} đầu sách mới vào Thư Viện.", newBooksCount);
        return newBooksCount;
    }

    private boolean processBookItem(GoogleBooksResponse.Item item) {
        try {
            GoogleBooksResponse.VolumeInfo info = item.getVolumeInfo();
            if (info == null || info.getTitle() == null) return false;

            String isbn = extractIsbn(info.getIndustryIdentifiers());
            if (isbn == null || isbn.isBlank()) isbn = item.getId();
            if (bookRepository.existsByIsbn(isbn)) return false;

            // --- Categories ---
            Set<Category> categories = new HashSet<>();
            if (info.getCategories() != null) {
                for (String catName : info.getCategories()) {
                    Category cat = categoryRepository.findByName(catName)
                        .orElseGet(() -> categoryRepository.save(Category.builder().name(catName).build()));
                    categories.add(cat);
                }
            }

            // --- Authors (fetch avatar từ Open Library nếu chưa có) ---
            Set<Author> authors = new HashSet<>();
            if (info.getAuthors() != null) {
                for (String authorName : info.getAuthors()) {
                    Author author = authorRepository.findByName(authorName)
                        .orElseGet(() -> {
                            String avatarUrl = fetchAuthorAvatar(authorName);
                            return authorRepository.save(Author.builder()
                                    .name(authorName)
                                    .avatarUrl(avatarUrl)
                                    .build());
                        });
                    // Nếu author đã tồn tại nhưng chưa có avatar → cập nhật
                    if (author.getAvatarUrl() == null || author.getAvatarUrl().isBlank()) {
                        String avatarUrl = fetchAuthorAvatar(authorName);
                        if (avatarUrl != null) {
                            author.setAvatarUrl(avatarUrl);
                            authorRepository.save(author);
                        }
                    }
                    authors.add(author);
                }
            }

            // --- Cover Image (lấy ảnh chất lượng cao nhất) ---
            String coverUrl = extractBestCoverUrl(info.getImageLinks(), item.getId());

            // --- Series Detection từ title ---
            BookSeries series = null;
            int seriesOrder = 0;
            SeriesInfo seriesInfo = detectSeries(info.getTitle());
            if (seriesInfo != null) {
                series = bookSeriesRepository.findByName(seriesInfo.name)
                    .orElseGet(() -> bookSeriesRepository.save(BookSeries.builder()
                            .name(seriesInfo.name)
                            .description("Bộ sách " + seriesInfo.name)
                            .coverUrl(coverUrl)
                            .build()));
                seriesOrder = seriesInfo.order;
                if (series.getCoverUrl() == null && coverUrl != null) {
                    series.setCoverUrl(coverUrl);
                    bookSeriesRepository.save(series);
                }
            }

            // --- Preview URL ---
            String previewUrl = info.getPreviewLink();
            if (previewUrl != null && previewUrl.startsWith("http:")) {
                previewUrl = previewUrl.replace("http:", "https:");
            }

            // --- Build Book ---
            Book book = Book.builder()
                .title(truncate(info.getTitle(), 255))
                .isbn(truncate(isbn, 20))
                .description(info.getDescription())
                .coverUrl(coverUrl)
                .previewUrl(previewUrl)
                .pageCount(info.getPageCount() != null ? info.getPageCount() : 0)
                .language(info.getLanguage() != null ? info.getLanguage() : "en")
                .series(series)
                .seriesOrder(seriesOrder)
                .quantity(10).availableQuantity(10).available(true)
                .publishedDate(parseDateString(info.getPublishedDate()))
                .categories(categories).authors(authors)
                .build();
            bookRepository.save(book);
            return true;
        } catch (Exception ex) {
            log.warn("Lỗi khi xử lý cuốn sách API ID '{}': {}", item.getId(), ex.getMessage());
            return false;
        }
    }

    // ======================== SERIES DETECTION ========================

    private record SeriesInfo(String name, int order) {}

    /**
     * Phân tích title để detect series + volume number.
     * VD: "Doraemon, Vol. 3" → SeriesInfo("Doraemon", 3)
     *     "One Piece 45" → SeriesInfo("One Piece", 45)
     */
    private SeriesInfo detectSeries(String title) {
        if (title == null) return null;
        String trimmed = title.trim();

        // Thử pattern chính: "Title, Vol. N", "Title Volume N", etc.
        Matcher matcher = SERIES_PATTERN.matcher(trimmed);
        if (matcher.matches()) {
            String name = matcher.group(1).trim();
            int order = Integer.parseInt(matcher.group(2));
            if (!name.isBlank() && order > 0 && order <= 9999) {
                return new SeriesInfo(name, order);
            }
        }

        // Thử pattern đơn giản: "Title N" (chỉ khi tên series >= 2 ký tự)
        Matcher simpleMatcher = SERIES_SIMPLE_NUMBER.matcher(trimmed);
        if (simpleMatcher.matches()) {
            String name = simpleMatcher.group(1).trim();
            int order = Integer.parseInt(simpleMatcher.group(2));
            if (name.length() >= 2 && order > 0 && order <= 9999) {
                return new SeriesInfo(name, order);
            }
        }

        return null;
    }

    // ======================== IMAGE HANDLING ========================

    /**
     * Lấy URL ảnh bìa tốt nhất. Nếu có imageLinks → zoom=2. Nếu không → URL từ volumeId.
     */
    private String extractBestCoverUrl(GoogleBooksResponse.ImageLinks imageLinks, String volumeId) {
        if (imageLinks != null && imageLinks.getThumbnail() != null) {
            String url = imageLinks.getThumbnail();
            if (url.startsWith("http:")) url = url.replace("http:", "https:");
            url = url.replace("zoom=1", "zoom=2").replace("zoom=5", "zoom=2");
            return url;
        }
        if (volumeId != null) {
            return "https://books.google.com/books/content?id=" + volumeId
                    + "&printsec=frontcover&img=1&zoom=2&source=gbs_api";
        }
        return null;
    }

    // ======================== AUTHOR AVATAR ========================

    /**
     * Fetch avatar tác giả từ Open Library Authors API.
     */
    @SuppressWarnings("unchecked")
    private String fetchAuthorAvatar(String authorName) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    OPEN_LIBRARY_AUTHOR_SEARCH, Map.class, authorName);
            if (response != null && response.containsKey("docs")) {
                List<Map<String, Object>> docs = (List<Map<String, Object>>) response.get("docs");
                if (docs != null && !docs.isEmpty()) {
                    String key = (String) docs.get(0).get("key");
                    if (key != null) {
                        return "https://covers.openlibrary.org/a/olid/" + key + "-M.jpg";
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Không tìm được avatar cho tác giả '{}': {}", authorName, e.getMessage());
        }
        return null;
    }

    // ======================== UTILITY ========================

    /**
     * Cập nhật avatar cho tất cả authors chưa có avatar trong DB.
     */
    @Transactional
    public int refreshMissingAuthorAvatars() {
        List<Author> authors = authorRepository.findAll();
        int updated = 0;
        for (Author author : authors) {
            if (author.getAvatarUrl() == null || author.getAvatarUrl().isBlank()) {
                String avatarUrl = fetchAuthorAvatar(author.getName());
                if (avatarUrl != null) {
                    author.setAvatarUrl(avatarUrl);
                    authorRepository.save(author);
                    updated++;
                    log.info("Cập nhật avatar cho tác giả: {}", author.getName());
                }
            }
        }
        return updated;
    }

    /**
     * Cập nhật cover, series, pageCount, language, previewUrl cho tất cả sách
     * chưa có cover hoặc cover cũ (zoom=1).
     * Tìm lại trên Google Books API theo ISBN hoặc title.
     */
    @Transactional
    public Map<String, Integer> refreshExistingBooks() {
        List<Book> allBooks = bookRepository.findAll();
        int coverUpdated = 0;
        int seriesUpdated = 0;
        int metadataUpdated = 0;

        for (Book book : allBooks) {
            boolean changed = false;

            // 1) Fix zoom=1 → zoom=2 trực tiếp (không cần gọi API)
            if (book.getCoverUrl() != null && book.getCoverUrl().contains("zoom=1")) {
                book.setCoverUrl(book.getCoverUrl().replace("zoom=1", "zoom=2"));
                coverUpdated++;
                changed = true;
            }

            // 2) Sách chưa có cover hoặc chưa có series → gọi API tìm lại
            boolean needsApiLookup = (book.getCoverUrl() == null || book.getCoverUrl().isBlank())
                    || (book.getSeries() == null && detectSeries(book.getTitle()) != null);

            if (needsApiLookup) {
                try {
                    String query = book.getIsbn() != null && book.getIsbn().matches("\\d{10,13}")
                            ? "isbn:" + book.getIsbn()
                            : book.getTitle();
                    GoogleBooksResponse response = restTemplate.getForObject(
                            GOOGLE_BOOKS_API_URL, GoogleBooksResponse.class, query);
                    if (response != null && response.getItems() != null && !response.getItems().isEmpty()) {
                        GoogleBooksResponse.Item item = response.getItems().get(0);
                        GoogleBooksResponse.VolumeInfo info = item.getVolumeInfo();

                        // Cover
                        if (book.getCoverUrl() == null || book.getCoverUrl().isBlank()) {
                            String newCover = extractBestCoverUrl(
                                    info != null ? info.getImageLinks() : null, item.getId());
                            if (newCover != null) {
                                book.setCoverUrl(newCover);
                                coverUpdated++;
                                changed = true;
                            }
                        }

                        if (info != null) {
                            // Series
                            if (book.getSeries() == null) {
                                SeriesInfo si = detectSeries(book.getTitle());
                                if (si != null) {
                                    BookSeries series = bookSeriesRepository.findByName(si.name)
                                            .orElseGet(() -> bookSeriesRepository.save(BookSeries.builder()
                                                    .name(si.name)
                                                    .description("Bộ sách " + si.name)
                                                    .coverUrl(book.getCoverUrl())
                                                    .build()));
                                    book.setSeries(series);
                                    book.setSeriesOrder(si.order);
                                    seriesUpdated++;
                                    changed = true;
                                }
                            }

                            // PageCount, Language, PreviewUrl
                            if (book.getPageCount() == 0 && info.getPageCount() != null && info.getPageCount() > 0) {
                                book.setPageCount(info.getPageCount());
                                metadataUpdated++;
                                changed = true;
                            }
                            if (("vi".equals(book.getLanguage()) || "en".equals(book.getLanguage()))
                                    && info.getLanguage() != null) {
                                book.setLanguage(info.getLanguage());
                            }
                            if (book.getPreviewUrl() == null && info.getPreviewLink() != null) {
                                String pUrl = info.getPreviewLink();
                                if (pUrl.startsWith("http:")) pUrl = pUrl.replace("http:", "https:");
                                book.setPreviewUrl(pUrl);
                                changed = true;
                            }
                        }
                    }
                } catch (Exception e) {
                    log.debug("Không thể refresh sách '{}': {}", book.getTitle(), e.getMessage());
                }
            }

            // 3) Kiểm tra series cho sách chỉ dựa vào title (không cần API)
            if (book.getSeries() == null) {
                SeriesInfo si = detectSeries(book.getTitle());
                if (si != null) {
                    BookSeries series = bookSeriesRepository.findByName(si.name)
                            .orElseGet(() -> bookSeriesRepository.save(BookSeries.builder()
                                    .name(si.name)
                                    .description("Bộ sách " + si.name)
                                    .coverUrl(book.getCoverUrl())
                                    .build()));
                    book.setSeries(series);
                    book.setSeriesOrder(si.order);
                    seriesUpdated++;
                    changed = true;
                }
            }

            if (changed) {
                bookRepository.save(book);
            }
        }

        return Map.of(
                "cover_updated", coverUpdated,
                "series_updated", seriesUpdated,
                "metadata_updated", metadataUpdated
        );
    }

    private String extractIsbn(List<GoogleBooksResponse.IndustryIdentifier> identifiers) {
        if (identifiers == null) return null;
        String isbn10 = null;
        for (GoogleBooksResponse.IndustryIdentifier id : identifiers) {
            if ("ISBN_13".equals(id.getType())) return id.getIdentifier();
            else if ("ISBN_10".equals(id.getType())) isbn10 = id.getIdentifier();
        }
        return isbn10;
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return null;
        return text.length() > maxLength ? text.substring(0, maxLength) : text;
    }

    private LocalDate parseDateString(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            if (dateStr.length() == 4) return LocalDate.of(Integer.parseInt(dateStr), 1, 1);
            else if (dateStr.length() == 7) return LocalDate.parse(dateStr + "-01");
            return LocalDate.parse(dateStr);
        } catch (Exception ignored) { return null; }
    }
}
