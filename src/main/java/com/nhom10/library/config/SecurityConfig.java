package com.nhom10.library.config;

import com.nhom10.library.security.RateLimitFilter;
import com.nhom10.library.security.UserDetailsServiceImpl;
import com.nhom10.library.security.jwt.JwtAccessDeniedHandler;
import com.nhom10.library.security.jwt.JwtAuthenticationEntryPoint;
import com.nhom10.library.security.jwt.JwtAuthenticationFilter;
import com.nhom10.library.security.oauth2.CustomOAuth2UserService;
import com.nhom10.library.security.oauth2.CustomOidcUserService;
import com.nhom10.library.security.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.nhom10.library.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.nhom10.library.security.oauth2.OAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Cấu hình Spring Security trung tâm.
 *
 * Các điểm bảo mật quan trọng:
 *  1. STATELESS session — không dùng HttpSession
 *  2. CSRF disabled — REST API dùng JWT, không cần CSRF token
 *  3. CORS — cấu hình từ AppProperties (allowedOrigins)
 *  4. JWT Filter — chạy trước UsernamePasswordAuthenticationFilter
 *  5. OAuth2 — stateless qua cookie-based request repository
 *  6. @EnableMethodSecurity — @PreAuthorize/@PostAuthorize ở method level
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Cho phép @PreAuthorize, @PostAuthorize, @Secured trên method
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOidcUserService customOidcUserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieOAuth2AuthorizationRequestRepository;
    private final AppProperties appProperties;

    // ================================================================
    // MAIN SECURITY FILTER CHAIN
    // ================================================================

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── 1. CSRF: tắt hoàn toàn (REST API + JWT = không cần CSRF) ─────
            .csrf(AbstractHttpConfigurer::disable)

            // ── 2. CORS: cấu hình từ bean corsConfigurationSource() ──────────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── 2b. Security Headers ─────────────────────────────────────────
            .headers(headers -> headers
                .contentTypeOptions(cto -> {})              // X-Content-Type-Options: nosniff
                .frameOptions(fo -> fo.deny())              // X-Frame-Options: DENY
                .httpStrictTransportSecurity(hsts -> hsts    // Strict-Transport-Security
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
                .xssProtection(xss -> xss
                    .headerValue(org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK)
                )
                .referrerPolicy(rp -> rp
                    .policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
            )

            // ── 3. Session: STATELESS (không tạo JSESSIONID) ─────────────────
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ── 4. Authorization Rules ────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — không cần token
                .requestMatchers(
                    "/api/auth/**",         // Login, register, forgot/reset password
                    "/api/health",          // Health check cho Docker/K8s
                    "/oauth2/**",           // OAuth2 authorization flow
                    "/login/oauth2/**"      // OAuth2 callback
                ).permitAll()

                // Swagger/OpenAPI docs (nếu thêm sau)
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()

                // Image proxy — <img> tags can't send JWT headers
                .requestMatchers(HttpMethod.GET, "/api/proxy/image").permitAll()

                // Uploaded files (avatars, etc.) — served as static resources
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                // GET public — ai cũng xem được sách, category, author, series, subscription plans
                .requestMatchers(HttpMethod.GET,
                    "/api/books/**",
                    "/api/categories/**",
                    "/api/authors/**",
                    "/api/series/**",
                    "/api/subscriptions/plans"
                ).permitAll()

                // Admin + Super Admin — quản lý toàn hệ thống
                .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN")

                // User + Admin
                .requestMatchers("/api/user/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                // Mọi request còn lại đều cần authentication
                .anyRequest().authenticated()
            )

            // ── 5. OAuth2 Login ───────────────────────────────────────────────
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(ae -> ae
                    // Frontend redirect đến: /oauth2/authorize/google?redirect_uri=...
                    .baseUri("/oauth2/authorize")
                    .authorizationRequestRepository(cookieOAuth2AuthorizationRequestRepository)
                )
                .redirectionEndpoint(re -> re
                    // Provider redirect về: /login/oauth2/code/google
                    .baseUri("/login/oauth2/code/*")
                )
                .userInfoEndpoint(uie -> uie
                    .userService(customOAuth2UserService)
                    .oidcUserService(customOidcUserService)
                )
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
            )

            // ── 6. Exception Handling ─────────────────────────────────────────
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)  // 401
                .accessDeniedHandler(jwtAccessDeniedHandler)             // 403
            )

            // ── 7. Authentication Provider ────────────────────────────────────
            .authenticationProvider(daoAuthenticationProvider())

            // ── 8. JWT Filter: chạy TRƯỚC UsernamePasswordAuthenticationFilter ─
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

            // ── 9. Rate Limit Filter: chạy TRƯỜC JWT Filter ───────────────
            .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    // ================================================================
    // CORS CONFIGURATION
    // ================================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Lấy từ application.yml: app.cors.allowed-origins
        List<String> allowedOrigins = Arrays.stream(
            appProperties.getCors().getAllowedOrigins().split(",")
        ).map(String::trim).toList();

        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);  // Cần cho cookie OAuth2
        config.setMaxAge(3600L);           // Cache preflight 1 giờ

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ================================================================
    // AUTHENTICATION PROVIDER & BEANS
    // ================================================================

    /**
     * DaoAuthenticationProvider: load user từ DB + verify password bằng BCrypt.
     * Được AuthenticationManager sử dụng khi xử lý login request.
     */
    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * BCryptPasswordEncoder strength=12 — đủ mạnh, khoảng 250ms/hash.
     * Không chọn strength quá cao (14+) vì sẽ chậm với nhiều concurrent login.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Expose AuthenticationManager để AuthService có thể gọi authenticate()
     * khi xử lý login request.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
