package com.nhom10.library.dto.response;

import com.nhom10.library.entity.User;
import com.nhom10.library.entity.UserSubscription;
import com.nhom10.library.entity.enums.AuthProvider;
import com.nhom10.library.entity.enums.MembershipTier;
import com.nhom10.library.entity.enums.Role;
import com.nhom10.library.entity.enums.SubscriptionStatus;
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

    // Thông tin gói đăng ký đang active (cho admin)
    private String activeSubscriptionPlanName;
    private LocalDateTime subscriptionEndDate;
    private SubscriptionStatus subscriptionStatus;

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

    public static UserResponse fromWithSubscription(User user, UserSubscription activeSub) {
        UserResponseBuilder builder = UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole())
            .enabled(user.isEnabled())
            .provider(user.getProvider())
            .avatarUrl(user.getAvatarUrl())
            .points(user.getPoints())
            .membershipTier(user.getMembershipTier())
            .createdAt(user.getCreatedAt());
        if (activeSub != null) {
            builder.activeSubscriptionPlanName(activeSub.getPlan().getName())
                   .subscriptionEndDate(activeSub.getEndDate())
                   .subscriptionStatus(activeSub.getStatus());
        }
        return builder.build();
    }
}
