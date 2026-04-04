package com.nhom10.library.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Kích hoạt JPA Auditing để @CreatedDate và @LastModifiedDate
 * trong BaseEntity tự động được điền giá trị.
 *
 * Tách thành class riêng (không đặt @EnableJpaAuditing trên @SpringBootApplication)
 * để tránh conflict khi viết Integration Test với @WebMvcTest
 * (WebMvcTest không load JPA context → sẽ lỗi nếu đặt ở main class).
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
    /*
     * Nếu sau này cần audit "ai đã tạo/sửa" (CreatedBy / LastModifiedBy),
     * uncomment đoạn dưới và thêm field @CreatedBy, @LastModifiedBy vào BaseEntity:
     *
     * @Bean
     * public AuditorAware<Long> auditorAware() {
     *     return () -> Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
     *         .filter(Authentication::isAuthenticated)
     *         .map(auth -> ((UserPrincipal) auth.getPrincipal()).getId());
     * }
     */
}
