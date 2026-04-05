package com.nhom10.library.controller;

import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller cho Tính năng năng cao: Trợ lý AI Tư vấn mượn sách.
 */
@RestController
@RequestMapping("/api/ai-assistant")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    /**
     * Endpoint nhận câu hỏi từ Khách hàng.
     * Ví dụ request body: {"message": "Tôi đang buồn, hãy gợi ý cho tôi 2 cuốn sách chữa lành!"}
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAi(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập câu hỏi cho AI."));
        }

        String aiResponse = aiAssistantService.getRecommendationFromGemini(principal.getId(), userMessage);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "assistant_reply", aiResponse
        ));
    }
}
