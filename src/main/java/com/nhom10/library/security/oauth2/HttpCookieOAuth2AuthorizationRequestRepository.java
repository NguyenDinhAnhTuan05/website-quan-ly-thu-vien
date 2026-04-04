package com.nhom10.library.security.oauth2;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;

/**
 * Lưu OAuth2AuthorizationRequest vào HttpOnly Cookie thay vì HttpSession.
 * → Đảm bảo stateless, hoạt động đúng với nhiều instance (load balancing).
 *
 * Cookies được tạo:
 *  - "oauth2_auth_request": serialized AuthorizationRequest
 *  - "redirect_uri":        redirect URI của frontend (để success handler biết redirect về đâu)
 *
 * Bảo mật:
 *  - HttpOnly: true → JS không đọc được (chống XSS)
 *  - Secure: true (production) → chỉ truyền qua HTTPS
 *  - SameSite: Lax → cho phép cross-site GET (cần cho OAuth2 redirect)
 *  - Max-Age: 180s (3 phút) → đủ thời gian hoàn thành OAuth2 flow
 */
@Component
@Slf4j
public class HttpCookieOAuth2AuthorizationRequestRepository
    implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_AUTH_REQUEST_COOKIE = "oauth2_auth_request";
    public static final String REDIRECT_URI_COOKIE        = "redirect_uri";
    private static final int   COOKIE_EXPIRE_SECONDS      = 180;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookieValue(request, OAUTH2_AUTH_REQUEST_COOKIE)
            .map(this::deserialize)
            .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeAuthorizationRequestCookies(request, response);
            return;
        }

        addCookie(response, OAUTH2_AUTH_REQUEST_COOKIE,
            serialize(authorizationRequest), COOKIE_EXPIRE_SECONDS);

        // Lưu redirect_uri từ query param của frontend
        String redirectUri = request.getParameter("redirect_uri");
        if (redirectUri != null && !redirectUri.isBlank()) {
            addCookie(response, REDIRECT_URI_COOKIE, redirectUri, COOKIE_EXPIRE_SECONDS);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                  HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        removeAuthorizationRequestCookies(request, response);
        return authRequest;
    }

    public Optional<String> getRedirectUriFromCookie(HttpServletRequest request) {
        return getCookieValue(request, REDIRECT_URI_COOKIE);
    }

    public void removeAuthorizationRequestCookies(HttpServletRequest request,
                                                   HttpServletResponse response) {
        deleteCookie(request, response, OAUTH2_AUTH_REQUEST_COOKIE);
        deleteCookie(request, response, REDIRECT_URI_COOKIE);
    }

    // ================================================================
    // HELPERS
    // ================================================================

    private Optional<String> getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies())
            .filter(c -> c.getName().equals(name))
            .findFirst()
            .map(Cookie::getValue);
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);
        // cookie.setSecure(true); // Bật khi deploy HTTPS production
        response.addCookie(cookie);
    }

    private void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        if (request.getCookies() == null) return;
        Arrays.stream(request.getCookies())
            .filter(c -> c.getName().equals(name))
            .forEach(c -> {
                c.setValue("");
                c.setPath("/");
                c.setMaxAge(0);
                response.addCookie(c);
            });
    }

    @SuppressWarnings("deprecation")
    private String serialize(OAuth2AuthorizationRequest request) {
        return Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(request));
    }

    @SuppressWarnings({"deprecation", "unchecked"})
    private OAuth2AuthorizationRequest deserialize(String value) {
        return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(
            Base64.getUrlDecoder().decode(value)
        );
    }
}
