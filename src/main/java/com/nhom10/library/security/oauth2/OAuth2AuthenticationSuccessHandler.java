package com.nhom10.library.security.oauth2;

import com.nhom10.library.config.AppProperties;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Xử lý sau khi OAuth2 đăng nhập THÀNH CÔNG:
 *  1. Lấy UserPrincipal từ authentication
 *  2. Sinh JWT (access + refresh token)
 *  3. Redirect về frontend với tokens trong query param
 *
 * Bảo mật redirect_uri:
 *  - Validate redirect_uri phải nằm trong whitelist (CORS allowed origins)
 *  - Tránh Open Redirect Attack
 *
 * Luồng frontend:
 *  Frontend → /oauth2/authorize/google?redirect_uri=http://localhost:3000/oauth2/callback
 *  Backend OAuth2 success → redirect http://localhost:3000/oauth2/callback?token=xxx&refreshToken=yyy
 *  Frontend lấy token từ URL, lưu vào localStorage/cookie, redirect về home
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final AppProperties appProperties;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            log.debug("Response đã được committed. Không thể redirect đến '{}'", targetUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    @Override
    protected String determineTargetUrl(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) {
        // Lấy redirect_uri từ cookie (được lưu bởi HttpCookieOAuth2AuthorizationRequestRepository)
        String redirectUri = cookieRepository.getRedirectUriFromCookie(request)
            .orElse(getDefaultTargetUrl());

        // Bảo mật: validate redirect_uri nằm trong whitelist
        if (!isAuthorizedRedirectUri(redirectUri)) {
            throw new IllegalArgumentException(
                "Redirect URI '" + redirectUri + "' không nằm trong danh sách cho phép. " +
                "Không thể tiếp tục xác thực."
            );
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String accessToken  = jwtTokenProvider.generateAccessToken(principal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        log.info("OAuth2 login thành công cho user: {}", principal.getEmail());

        return UriComponentsBuilder.fromUriString(redirectUri)
            .queryParam("token", accessToken)
            .queryParam("refreshToken", refreshToken)
            .build().toUriString();
    }

    private void clearAuthenticationAttributes(HttpServletRequest request,
                                               HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        cookieRepository.removeAuthorizationRequestCookies(request, response);
    }

    /**
     * Kiểm tra redirect_uri có nằm trong CORS allowed origins không.
     * Tránh Open Redirect Attack.
     */
    private boolean isAuthorizedRedirectUri(String uri) {
        List<String> allowedOrigins = Arrays.asList(
            appProperties.getCors().getAllowedOrigins().split(",")
        );
        return allowedOrigins.stream()
            .map(String::trim)
            .anyMatch(uri::startsWith);
    }
}
