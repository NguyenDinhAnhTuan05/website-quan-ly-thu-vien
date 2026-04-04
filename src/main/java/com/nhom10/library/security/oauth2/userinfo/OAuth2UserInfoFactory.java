package com.nhom10.library.security.oauth2.userinfo;

import com.nhom10.library.exception.BadRequestException;

import java.util.Map;

/**
 * Factory — tạo OAuth2UserInfo đúng subclass dựa trên registrationId (tên provider).
 * Mở rộng thêm provider mới: chỉ cần thêm case vào switch.
 */
public class OAuth2UserInfoFactory {

    private OAuth2UserInfoFactory() {} // Utility class — không khởi tạo

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId,
                                                    Map<String, Object> attributes) {
        return switch (registrationId.toLowerCase()) {
            case "google" -> new GoogleOAuth2UserInfo(attributes);
            case "github" -> new GithubOAuth2UserInfo(attributes);
            default -> throw new BadRequestException(
                "OAuth2 provider '" + registrationId + "' chưa được hỗ trợ."
            );
        };
    }
}
