package com.nhom10.library.security;

import com.nhom10.library.entity.User;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Load user từ DB cho Spring Security (form login và JWT filter).
 * "username" ở đây là EMAIL (thống nhất với OAuth2).
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Được gọi bởi:
     *  1. AuthenticationManager khi xử lý UsernamePasswordAuthenticationToken (login).
     *  2. JwtAuthenticationFilter khi validate JWT từ request.
     *
     * @param email dùng email làm "username" identifier.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "Không tìm thấy user với email: " + email
            ));
        return UserPrincipal.create(user);
    }

    /**
     * Load user theo ID — dùng trong JwtAuthenticationFilter (sau khi parse JWT).
     * Hiệu quả hơn vì tránh phải query lại theo email khi đã có id trong JWT claim.
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserPrincipal.create(user);
    }
}
