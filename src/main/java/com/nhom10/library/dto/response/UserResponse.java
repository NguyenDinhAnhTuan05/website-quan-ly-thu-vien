package com.nhom10.library.dto.response;

import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.AuthProvider;
import com.nhom10.library.entity.enums.MembershipTier;
import com.nhom10.library.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Role role;
    private boolean enabled;
    private AuthProvider provider;
    private String avatarUrl;
    private int points;
    private MembershipTier membershipTier;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole())
            .enabled(user.isEnabled())
            .provider(user.getProvider())
            .avatarUrl(user.getAvatarUrl())
            .points(user.getPoints())
            .membershipTier(user.getMembershipTier())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
