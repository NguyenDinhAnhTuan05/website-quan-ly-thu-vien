package com.nhom10.library.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Ánh xạ tất cả config bắt đầu bằng "app." trong application.yml
 * vào một object type-safe. Tránh dùng @Value rải rác khắp nơi.
 *
 * Đăng ký tự động nhờ @Component (không cần @EnableConfigurationProperties riêng).
 */
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private Jwt jwt = new Jwt();
    private PasswordReset passwordReset = new PasswordReset();
    private Cors cors = new Cors();

    @Data
    public static class Jwt {
        private String secret;
        private long expiration;        // access token TTL (ms), mặc định 1 ngày
        private long refreshExpiration; // refresh token TTL (ms), mặc định 7 ngày
    }

    @Data
    public static class PasswordReset {
        private long tokenExpiration;   // reset token TTL (ms), mặc định 15 phút
    }

    @Data
    public static class Cors {
        private String allowedOrigins;  // comma-separated, ví dụ: "http://localhost:3000,http://localhost:5173"
    }
}
