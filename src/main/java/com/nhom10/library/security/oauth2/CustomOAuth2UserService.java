package com.nhom10.library.security.oauth2;

import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.AuthProvider;
import com.nhom10.library.entity.enums.Role;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.repository.UserRepository;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.security.oauth2.userinfo.OAuth2UserInfo;
import com.nhom10.library.security.oauth2.userinfo.OAuth2UserInfoFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Xử lý thông tin user sau khi OAuth2 provider xác thực thành công.
 * Quy trình:
 *  1. Lấy attributes từ provider (Google/GitHub)
 *  2. Tạo OAuth2UserInfo để chuẩn hóa data
 *  3. Kiểm tra user đã tồn tại chưa (theo email):
 *     - Chưa có: tạo user mới với provider info
 *     - Đã có (LOCAL): ném exception (email đã đăng ký bằng form, không dùng OAuth2)
 *     - Đã có (cùng provider): cập nhật avatar/name
 *  4. Trả về UserPrincipal
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
            registrationId, oAuth2User.getAttributes()
        );

        if (userInfo.getEmail() == null || userInfo.getEmail().isBlank()) {
            throw new BadRequestException("Không lấy được email từ tài khoản " + registrationId);
        }

        User user = userRepository.findByEmail(userInfo.getEmail())
            .map(existingUser -> updateExistingUser(existingUser, userInfo, registrationId))
            .orElseGet(() -> registerNewOAuth2User(userInfo, registrationId));

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    /** Tạo user mới từ thông tin OAuth2 */
    private User registerNewOAuth2User(OAuth2UserInfo userInfo, String registrationId) {
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        User newUser = User.builder()
            .email(userInfo.getEmail())
            .username(generateUsername(userInfo))
            .avatarUrl(userInfo.getAvatarUrl())
            .provider(provider)
            .providerId(userInfo.getId())
            .role(Role.ROLE_USER)
            .enabled(true)
            // password null — OAuth2 user không login bằng password
            .build();
        log.info("Đăng ký user OAuth2 mới: {} via {}", userInfo.getEmail(), registrationId);
        return userRepository.save(newUser);
    }

    /** Cập nhật avatar/name nếu user đã tồn tại với cùng provider */
    private User updateExistingUser(User user, OAuth2UserInfo userInfo, String registrationId) {
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        // User đã đăng ký bằng form login → không cho đăng nhập OAuth2 cùng email
        if (user.getProvider() == AuthProvider.LOCAL) {
            throw new BadRequestException(
                "Email '" + user.getEmail() + "' đã được đăng ký bằng form. " +
                "Vui lòng đăng nhập bằng mật khẩu."
            );
        }
        // User dùng provider khác (ví dụ: email đó đã link Google, nay dùng GitHub)
        if (user.getProvider() != provider) {
            throw new BadRequestException(
                "Email '" + user.getEmail() + "' đã được liên kết với " + user.getProvider() + ". " +
                "Vui lòng đăng nhập bằng " + user.getProvider() + "."
            );
        }

        // Cập nhật avatar (ảnh có thể thay đổi)
        user.setAvatarUrl(userInfo.getAvatarUrl());
        return userRepository.save(user);
    }

    /** Tạo username unique từ thông tin OAuth2 */
    private String generateUsername(OAuth2UserInfo userInfo) {
        String base = userInfo.getEmail().split("@")[0];
        String candidate = base;
        int i = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + i++;
        }
        return candidate;
    }
}
