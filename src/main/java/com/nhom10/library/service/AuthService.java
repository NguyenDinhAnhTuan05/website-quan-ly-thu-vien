package com.nhom10.library.service;

import com.nhom10.library.config.AppProperties;
import com.nhom10.library.dto.request.ForgotPasswordRequest;
import com.nhom10.library.dto.request.LoginRequest;
import com.nhom10.library.dto.request.RegisterRequest;
import com.nhom10.library.dto.request.ResetPasswordRequest;
import com.nhom10.library.dto.response.AuthResponse;
import com.nhom10.library.entity.PasswordResetToken;
import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.AuthProvider;
import com.nhom10.library.entity.enums.Role;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.PasswordResetTokenRepository;
import com.nhom10.library.repository.UserRepository;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final AppProperties appProperties;

    // ================================================================
    // REGISTER
    // ================================================================

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate unique constraints
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' đã được sử dụng.");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' đã được sử dụng.");
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
            .role(Role.ROLE_USER)
            .provider(AuthProvider.LOCAL)
            .enabled(true)
            .build();

        User savedUser = userRepository.save(user);
        log.info("Đăng ký thành công: {}", savedUser.getEmail());

        UserPrincipal principal = UserPrincipal.create(savedUser);
        return buildAuthResponse(principal, savedUser);
    }

    // ================================================================
    // LOGIN
    // ================================================================

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // AuthenticationManager gọi UserDetailsServiceImpl.loadUserByUsername()
        // → kiểm tra email tồn tại + password BCrypt match
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // Kiểm tra tài khoản có bị vô hiệu hóa không
        if (!principal.isEnabled()) {
            throw new DisabledException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ admin.");
        }

        User user = userRepository.findByEmail(principal.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", principal.getEmail()));

        return buildAuthResponse(principal, user);
    }

    // ================================================================
    // REFRESH TOKEN
    // ================================================================

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        String email = jwtTokenProvider.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(principal);

        return AuthResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(refreshToken) // Giữ nguyên refresh token
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .role(user.getRole().name())
            .build();
    }

    // ================================================================
    // FORGOT PASSWORD
    // ================================================================

    /**
     * Luôn trả về cùng message dù email tồn tại hay không.
     * → Tránh User Enumeration Attack (kẻ tấn công đoán email hợp lệ).
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            // Vô hiệu hóa tất cả token cũ trước khi tạo token mới
            tokenRepository.invalidateAllByUserId(user.getId());

            String token = UUID.randomUUID().toString();
            long expirationMs = appProperties.getPasswordReset().getTokenExpiration();

            PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusNanos(expirationMs * 1_000_000))
                .build();

            tokenRepository.save(resetToken);

            // Gửi email bất đồng bộ — không delay response
            emailService.sendPasswordResetEmail(
                user.getEmail(),
                token,
                user.getUsername() != null ? user.getUsername() : user.getEmail()
            );
        });
        // Dù không tìm thấy email, vẫn response thành công (anti-enumeration)
        log.info("Forgot password request cho email: {}", request.getEmail());
    }

    // ================================================================
    // RESET PASSWORD
    // ================================================================

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("Token không hợp lệ."));

        // Dùng helper method trong entity
        if (!resetToken.isValid()) {
            throw new BadRequestException("Token đã hết hạn hoặc đã được sử dụng.");
        }

        User user = resetToken.getUser();

        // Kiểm tra user dùng OAuth2 (không có password local)
        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException(
                "Tài khoản này đăng nhập qua " + user.getProvider() + ". Không thể đặt lại mật khẩu."
            );
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.markAsUsed();
        tokenRepository.save(resetToken);

        log.info("Reset password thành công cho user: {}", user.getEmail());
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private AuthResponse buildAuthResponse(UserPrincipal principal, User user) {
        return AuthResponse.builder()
            .accessToken(jwtTokenProvider.generateAccessToken(principal))
            .refreshToken(jwtTokenProvider.generateRefreshToken(principal))
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .role(user.getRole().name())
            .avatarUrl(user.getAvatarUrl())
            .build();
    }
}
