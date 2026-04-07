package com.nhom10.library.service;

import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.MembershipTier;
import com.nhom10.library.entity.enums.PointActionType;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import com.nhom10.library.exception.ForbiddenException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.BookRepository;
import com.nhom10.library.repository.CategoryRepository;
import com.nhom10.library.repository.PointTransactionRepository;
import com.nhom10.library.repository.UserRepository;
import com.nhom10.library.repository.UserSubscriptionRepository;
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

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAssistantService {

    @Value("${gemini.api-key:YOUR_GEMINI_TEST_KEY}")
    private String geminiApiKey;

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GEMINI_API_URL = 
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    public String getRecommendationFromGemini(Long userId, String userMessage) {
        // 1. Kiểm tra quyền hạn
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isPremium = userSubscriptionRepository
            .findFirstByUserIdAndStatusOrderByEndDateDesc(userId, SubscriptionStatus.ACTIVE).isPresent();

        if (!isPremium) {
            if (user.getMembershipTier() == MembershipTier.BRONZE) {
                throw new ForbiddenException("Chức năng Trợ lý AI yêu cầu hạng SILVER trở lên hoặc gói Premium.");
            }
            
            if (user.getMembershipTier() == MembershipTier.SILVER) {
                // Kiểm tra giới hạn 5 lượt/ngày (Dùng action CHECK_IN để demo hoặc bạn có thể tạo enum mới)
                long todayAiCalls = pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                    .filter(t -> t.getActionType() == PointActionType.CHECK_IN && 
                              t.getCreatedAt().toLocalDate().equals(LocalDate.now()))
                    .count();
                if (todayAiCalls >= 5) {
                    throw new ForbiddenException("Hạng SILVER chỉ được sử dụng AI 5 lượt mỗi ngày. Hãy nâng cấp lên GOLD hoặc PREMIUM!");
                }
            }
        }

        // 2. RAG Logic
        String keyword = extractKeyword(userMessage);
        List<Book> relevantBooks = bookRepository.findTop10ByKeyword(keyword, PageRequest.of(0, 10));
        
        String booksContext = relevantBooks.stream()
            .map(b -> String.format("- %s (ISBN: %s): %s", 
                b.getTitle(), b.getIsbn(), 
                b.getDescription() != null ? (b.getDescription().substring(0, Math.min(b.getDescription().length(), 100)) + "...") : "Không có mô tả"))
            .collect(Collectors.joining("\n"));

        String systemPrompt = "Bạn là 'Thủ thư ảo Nhóm 10'. Tư vấn sách dựa trên kho:\n" + booksContext;
        String combinedMessage = systemPrompt + "\n\nCâu hỏi: " + userMessage;

        String requestJson = String.format("{\"contents\": [{\"parts\":[{\"text\": \"%s\"}]}]}", 
            combinedMessage.replace("\"", "\\\"").replace("\n", "\\n"));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-goog-api-key", geminiApiKey);
            HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_API_URL, entity, String.class);
            return extractTextFromResponse(response.getBody());
        } catch (Exception e) {
            log.error("AI Error: {}", e.getMessage());
            return "Trợ lý ảo đang bận, thử lại sau nhé!";
        }
    }

    private String extractKeyword(String message) {
        return message.toLowerCase().replace("?", "").trim();
    }

    private String extractTextFromResponse(String jsonResponse) {
        if (jsonResponse == null || !jsonResponse.contains("\"text\":")) return "Lỗi AI.";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"text\":\\s*\"([^\"]*)\"");
        java.util.regex.Matcher m = p.matcher(jsonResponse);
        return m.find() ? m.group(1).replace("\\n", "\n") : "Lỗi AI.";
    }
}
