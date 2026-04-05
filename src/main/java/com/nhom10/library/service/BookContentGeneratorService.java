package com.nhom10.library.service;

import com.nhom10.library.entity.Book;
import com.nhom10.library.repository.BookRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookContentGeneratorService {

    private final BookRepository bookRepository;
    private final EntityManager entityManager;
    private final TransactionTemplate transactionTemplate;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    /**
     * Generate content for ALL books that have no content yet.
     * Uses native SQL to find books without content (bypasses Hibernate cache).
     * Each book is saved in its own transaction via saveBookContent().
     */
    public int generateContentForAllBooks() {
        // Use native SQL to reliably find books without content
        @SuppressWarnings("unchecked")
        List<Long> bookIds = entityManager.createNativeQuery(
                "SELECT id FROM books WHERE deleted = 0 AND (content IS NULL OR content = '')"
        ).getResultList();

        log.info("Found {} books without content", bookIds.size());
        if (bookIds.isEmpty()) return 0;

        int successCount = 0;
        for (int i = 0; i < bookIds.size(); i++) {
            Long bookId = ((Number) bookIds.get(i)).longValue();
            try {
                log.info("[{}/{}] Generating content for book ID={}", i + 1, bookIds.size(), bookId);
                generateAndSaveContent(bookId);
                successCount++;
                log.info("[{}/{}] SUCCESS book ID={}", i + 1, bookIds.size(), bookId);

                // Rate limit: 5 seconds between Gemini API calls (free tier: 20/min)
                if (i < bookIds.size() - 1) {
                    Thread.sleep(5000);
                }
            } catch (Exception e) {
                log.error("[{}/{}] FAILED book ID={}: {}", i + 1, bookIds.size(), bookId, e.getMessage());
            }
        }
        log.info("Content generation complete: {}/{} books updated", successCount, bookIds.size());
        return successCount;
    }

    /**
     * Generate and save content for a single book.
     * Uses TransactionTemplate to ensure proper transaction boundary
     * (avoids Spring proxy self-invocation issue).
     */
    public void generateAndSaveContent(Long bookId) {
        transactionTemplate.executeWithoutResult(status -> {
            Book book = bookRepository.findByIdWithDetails(bookId)
                    .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

            String htmlContent = generateContentForBook(book);
            book.setContent(htmlContent);
            bookRepository.save(book);
            log.info("Saved content for book ID={} '{}' ({} chars)", bookId, book.getTitle(), htmlContent.length());
        });
    }

    private String generateContentForBook(Book book) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new RuntimeException("GEMINI_API_KEY is not configured");
        }

        String authors = book.getAuthors() != null
                ? book.getAuthors().stream().map(a -> a.getName()).collect(Collectors.joining(", "))
                : "Không rõ";
        String categories = book.getCategories() != null
                ? book.getCategories().stream().map(c -> c.getName()).collect(Collectors.joining(", "))
                : "Không rõ";

        String prompt = buildPrompt(book.getTitle(), authors, categories,
                book.getDescription(), book.getLanguage());

        String requestBody = """
                {
                  "contents": [{"parts": [{"text": %s}]}],
                  "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 8192
                  }
                }
                """.formatted(escapeJson(prompt));

        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(30))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GEMINI_URL + geminiApiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(120))
                    .build();

            // Retry up to 5 times on 429 (rate limit), with 60s wait
            HttpResponse<String> response = null;
            for (int retry = 0; retry < 5; retry++) {
                response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 429) {
                    log.warn("Rate limited (429), waiting 60s before retry {}/5...", retry + 1);
                    Thread.sleep(60000);
                } else {
                    break;
                }
            }

            if (response.statusCode() != 200) {
                throw new RuntimeException("Gemini API error " + response.statusCode() + ": "
                        + response.body().substring(0, Math.min(500, response.body().length())));
            }

            return extractHtmlFromResponse(response.body());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate content for '" + book.getTitle() + "': " + e.getMessage(), e);
        }
    }

    private String buildPrompt(String title, String authors, String categories,
                                String description, String language) {
        String lang = "vi".equals(language) ? "tiếng Việt" : "English";
        return """
                Bạn là chuyên gia văn học. Hãy viết một bài phân tích/giới thiệu chi tiết về cuốn sách sau bằng %s.

                Thông tin sách:
                - Tên: %s
                - Tác giả: %s
                - Thể loại: %s
                - Mô tả: %s

                Yêu cầu:
                1. Viết bằng HTML thuần (không cần <html>, <head>, <body>)
                2. Độ dài: 3000-5000 từ
                3. Cấu trúc bắt buộc:
                   - <div class="book-content">
                     - <div class="book-intro"> Giới thiệu tổng quan </div>
                     - <h2> Về tác giả </h2> <p>...</p>
                     - <h2> Tóm tắt nội dung </h2> (chia theo chương/phần nếu có)
                     - <h2> Phân tích nhân vật </h2>
                     - <h2> Chủ đề và thông điệp </h2>
                     - <h2> Phong cách nghệ thuật </h2>
                     - <h2> Ý nghĩa và ảnh hưởng </h2>
                     - <h2> Kết luận </h2>
                   - </div>
                4. Sử dụng các thẻ HTML: h2, h3, p, blockquote, ul, li, em, strong
                5. KHÔNG sử dụng markdown, chỉ HTML thuần
                6. Nội dung phải chính xác, có giá trị học thuật
                """.formatted(lang, title, authors, categories,
                description != null ? description : "Không có mô tả");
    }

    private String extractHtmlFromResponse(String jsonResponse) {
        // Find "text": "..." in the response
        int textIdx = jsonResponse.indexOf("\"text\"");
        if (textIdx == -1) throw new RuntimeException("No 'text' field in Gemini response");

        int colonIdx = jsonResponse.indexOf(":", textIdx);
        int startQuote = jsonResponse.indexOf("\"", colonIdx + 1);
        if (startQuote == -1) throw new RuntimeException("Cannot parse Gemini response");

        // Find the closing quote (handle escaped quotes)
        StringBuilder sb = new StringBuilder();
        int i = startQuote + 1;
        while (i < jsonResponse.length()) {
            char c = jsonResponse.charAt(i);
            if (c == '\\' && i + 1 < jsonResponse.length()) {
                char next = jsonResponse.charAt(i + 1);
                switch (next) {
                    case '"' -> { sb.append('"'); i += 2; }
                    case '\\' -> { sb.append('\\'); i += 2; }
                    case 'n' -> { sb.append('\n'); i += 2; }
                    case 'r' -> { sb.append('\r'); i += 2; }
                    case 't' -> { sb.append('\t'); i += 2; }
                    default -> { sb.append(c); i++; }
                }
            } else if (c == '"') {
                break;
            } else {
                sb.append(c);
                i++;
            }
        }

        String content = sb.toString().trim();
        // Strip markdown code blocks if present
        if (content.startsWith("```html")) {
            content = content.substring(7);
        } else if (content.startsWith("```")) {
            content = content.substring(3);
        }
        if (content.endsWith("```")) {
            content = content.substring(0, content.length() - 3);
        }
        return content.trim();
    }

    private String escapeJson(String text) {
        return "\"" + text
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }
}
