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
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Xử lý OIDC user (Google dùng OpenID Connect).
 * Logic giống CustomOAuth2UserService nhưng kế thừa OidcUserService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
            registrationId, oidcUser.getAttributes()
        );

        if (userInfo.getEmail() == null || userInfo.getEmail().isBlank()) {
            throw new BadRequestException("Không lấy được email từ tài khoản " + registrationId);
        }

        User user = userRepository.findByEmail(userInfo.getEmail())
            .map(existingUser -> updateExistingUser(existingUser, userInfo, registrationId))
            .orElseGet(() -> registerNewOAuth2User(userInfo, registrationId));

        UserPrincipal principal = UserPrincipal.create(user, oidcUser.getAttributes());
        principal.setOidcInfo(oidcUser.getIdToken(), oidcUser.getUserInfo());
        return principal;
    }

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
            .build();
        log.info("Đăng ký user OIDC mới: {} via {}", userInfo.getEmail(), registrationId);
        return userRepository.save(newUser);
    }

    private User updateExistingUser(User user, OAuth2UserInfo userInfo, String registrationId) {
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        if (user.getProvider() == AuthProvider.LOCAL) {
            throw new BadRequestException(
                "Email '" + user.getEmail() + "' đã được đăng ký bằng form. " +
                "Vui lòng đăng nhập bằng mật khẩu."
            );
        }
        if (user.getProvider() != provider) {
            throw new BadRequestException(
                "Email '" + user.getEmail() + "' đã được liên kết với " + user.getProvider() + ". " +
                "Vui lòng đăng nhập bằng " + user.getProvider() + "."
            );
        }

        user.setAvatarUrl(userInfo.getAvatarUrl());
        return userRepository.save(user);
    }

    private String generateUsername(OAuth2UserInfo userInfo) {
        String base = userInfo.getEmail().split("@")[0];
        if (userRepository.existsByUsername(base)) {
            return base + "_" + System.currentTimeMillis() % 10000;
        }
        return base;
    }
}
