package com.nhom10.library.security.jwt;

import com.nhom10.library.security.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter chạy MỘT LẦN mỗi request (OncePerRequestFilter).
 * Quy trình:
 *  1. Extract JWT từ header "Authorization: Bearer <token>"
 *  2. Validate token (chữ ký, hết hạn...)
 *  3. Load UserDetails từ userId trong JWT claim
 *  4. Set Authentication vào SecurityContext cho request này
 *
 * Lý do dùng userId trong claim (không phải email):
 *  → Tránh query DB thêm 1 lần (findByEmail) mỗi request.
 *    loadUserById dùng PK index → cực nhanh.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                Long userId = jwtTokenProvider.extractUserId(jwt);

                UserDetails userDetails = userDetailsService.loadUserById(userId);

                // Không cần credentials (đã authenticated qua JWT)
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Log lỗi nhưng không throw → để SecurityContext null
            // → JwtAuthenticationEntryPoint sẽ xử lý 401
            log.error("Không thể set authentication từ JWT: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT từ header "Authorization: Bearer <token>".
     * Trả về null nếu header không tồn tại hoặc không đúng format.
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
