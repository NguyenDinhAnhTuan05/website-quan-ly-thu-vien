package com.nhom10.library.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

/**
 * Response cho các Auth endpoint.
 * @JsonInclude(NON_NULL): các field null sẽ không xuất hiện trong JSON
 * → Ví dụ: refreshToken = null khi chỉ dùng accessToken.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    // User info cơ bản (không trả toàn bộ User entity)
    private Long userId;
    private String email;
    private String username;
    private String role;
    private String avatarUrl;
}
