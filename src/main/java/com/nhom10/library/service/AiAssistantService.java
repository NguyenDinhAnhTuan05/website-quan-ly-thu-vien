package com.nhom10.library.service;

import com.nhom10.library.entity.Book;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Tích hợp Trí tuệ Nhân tạo Google Gemini (AI Chatbot Tư Vấn).
 * Nâng cấp RAG (Retrieval-Augmented Generation): AI tư vấn dựa trên sách thực tế trong DB.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiAssistantService {

    @Value("${gemini.api-key:YOUR_GEMINI_TEST_KEY}")
    private String geminiApiKey;

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GEMINI_API_URL = 
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=";

    /**
     * Phương thức gọi và giao tiếp với nhân AI Google Gemini.
     */
    public String getRecommendationFromGemini(String userMessage) {
        // 1. Trích xuất từ khóa đơn giản từ câu hỏi (Ví dụ: "Sách kinh tế" -> "kinh tế")
        String keyword = extractKeyword(userMessage);

        // 2. Lấy danh sách 10 cuốn sách liên quan nhất từ Database (RAG - Retrieval)
        List<Book> relevantBooks = bookRepository.findTop10ByKeyword(keyword, PageRequest.of(0, 10));
        
        String booksContext = relevantBooks.stream()
            .map(b -> String.format("- %s (ISBN: %s, Còn: %d cuốn): %s", 
                b.getTitle(), b.getIsbn(), b.getAvailableQuantity(), 
                b.getDescription() != null ? (b.getDescription().substring(0, Math.min(b.getDescription().length(), 100)) + "...") : "Không có mô tả"))
            .collect(Collectors.joining("\n"));

        // 3. Xây dựng System Prompt cực kỳ chi tiết (Augmentation)
        String systemPrompt = "Bạn là 'Thủ thư ảo Nhóm 10'. Nhiệm vụ của bạn là tư vấn sách DỰA TRÊN KHO SÁCH CÓ THẬT của thư viện.\n" +
            "Dưới đây là danh sách sách phù hợp mà tôi tìm thấy trong kho:\n" +
            (booksContext.isEmpty() ? "[Hiện tại kho chưa có cuốn nào khớp hoàn toàn với yêu cầu này]" : booksContext) + "\n\n" +
            "QUY TẮC:\n" +
            "1. Luôn ưu tiên gợi ý những cuốn sách có trong danh sách trên.\n" +
            "2. Nếu không có sách khớp, hãy xin lỗi khéo léo và gợi ý người dùng tìm theo chủ đề khác.\n" +
            "3. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa 4-5 câu).\n" +
            "4. Thêm icon 📚✨ phù hợp.";

        // 4. Gọi API Gemini (Generation)
        String combinedMessage = systemPrompt + "\n\nCâu hỏi của Độc giả: " + userMessage;

        String requestJson = String.format("""
            {
               "contents": [{
                   "parts":[{"text": "%s"}]
               }]
            }
            """, combinedMessage.replace("\"", "\\\"").replace("\n", "\\n"));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                GEMINI_API_URL + geminiApiKey, 
                entity, 
                String.class
            );

            return extractTextFromResponse(response.getBody());

        } catch (Exception e) {
            log.error("Có lỗi khi gọi Google Gemini API: {}", e.getMessage());
            return "Xin lỗi bạn, trợ lý ảo đang bận một chút. Bạn thử hỏi lại sau nhé! 😅";
        }
    }

    private String extractKeyword(String message) {
        // Logic đơn giản: lấy 3 từ cuối hoặc cụm từ sau "về", "sách"
        String cleaned = message.toLowerCase().replace("?", "").replace(".", "");
        if (cleaned.contains("về ")) {
            return cleaned.substring(cleaned.lastIndexOf("về ") + 3).trim();
        }
        return cleaned;
    }

    private String extractTextFromResponse(String jsonResponse) {
        if (jsonResponse == null || !jsonResponse.contains("\"text\":")) {
            return "Không tìm thấy nội dung phản hồi từ AI.";
        }
        try {
            // Sử dụng regex đơn giản để lấy nội dung trong "text": "..."
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"text\":\\s*\"([^\"]*)\"");
            java.util.regex.Matcher matcher = pattern.matcher(jsonResponse);
            if (matcher.find()) {
                return matcher.group(1).replace("\\n", "\n").replace("\\\"", "\"");
            }
            return "Lỗi định dạng phản hồi.";
        } catch (Exception ex) {
            return "Xin lỗi, tôi gặp lỗi khi xử lý câu trả lời.";
        }
    }
}
