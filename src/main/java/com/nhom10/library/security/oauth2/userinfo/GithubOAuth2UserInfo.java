package com.nhom10.library.security.oauth2.userinfo;

import java.util.Map;

/**
 * GitHub OAuth2 attributes:
 *  - id:         unique identifier (integer, cast sang String)
 *  - login:      username
 *  - email:      email (có thể null nếu user ẩn email trên GitHub)
 *  - avatar_url: avatar URL
 *
 * Lưu ý email GitHub:
 *  GitHub cho phép ẩn email công khai → email có thể null.
 *  Trong CustomOAuth2UserService cần xử lý trường hợp này
 *  (có thể dùng GitHub API /user/emails để lấy email verified).
 *  Hiện tại: nếu email null → tạo email giả dạng "{login}@github.local"
 */
public class GithubOAuth2UserInfo extends OAuth2UserInfo {

    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        String email = (String) attributes.get("email");
        if (email == null || email.isBlank()) {
            // Fallback khi user ẩn email trên GitHub
            String login = (String) attributes.get("login");
            return login + "@github.local";
        }
        return email;
    }

    @Override
    public String getAvatarUrl() {
        return (String) attributes.get("avatar_url");
    }
}
