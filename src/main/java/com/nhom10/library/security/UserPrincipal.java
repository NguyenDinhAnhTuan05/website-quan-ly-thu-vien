package com.nhom10.library.security;

import com.nhom10.library.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

/**
 * Wrapper của User entity, implement cả UserDetails (form login / JWT)
 * lẫn OAuth2User (OAuth2 login).
 *
 * Lý do KHÔNG cho User entity implement UserDetails trực tiếp:
 *  - Tách biệt concern: entity JPA ≠ security principal.
 *  - Tránh Hibernate load thêm proxy khi Spring Security dùng principal.
 *  - Dễ dàng thêm OAuth2 attributes mà không "ô nhiễm" entity.
 */
@Getter
public class UserPrincipal implements UserDetails, OAuth2User {

    private final Long id;
    private final String email;
    private final String password;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;

    // OAuth2 attributes — null khi login bằng form/JWT
    private Map<String, Object> attributes;

    private UserPrincipal(Long id, String email, String password,
                          boolean enabled,
                          Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
    }

    // ================================================================
    // FACTORY METHODS
    // ================================================================

    /** Dùng khi load từ DB (UserDetailsService) hoặc validate JWT */
    public static UserPrincipal create(User user) {
        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.isEnabled(),
            Collections.singletonList(
                new SimpleGrantedAuthority(user.getRole().name())
            )
        );
    }

    /** Dùng khi OAuth2 login thành công (CustomOAuth2UserService) */
    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        UserPrincipal principal = create(user);
        principal.attributes = attributes;
        return principal;
    }

    // ================================================================
    // UserDetails overrides
    // ================================================================

    @Override
    public String getUsername() {
        return email; // Dùng email làm username để hỗ trợ cả OAuth2
    }

    @Override
    public boolean isAccountNonExpired()  { return true; }

    @Override
    public boolean isAccountNonLocked()   { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    // ================================================================
    // OAuth2User overrides
    // ================================================================

    /** OAuth2User.getName() — trả về userId dưới dạng string */
    @Override
    public String getName() {
        return String.valueOf(id);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
}
