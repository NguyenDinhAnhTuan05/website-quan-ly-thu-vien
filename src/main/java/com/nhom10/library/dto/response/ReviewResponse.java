package com.nhom10.library.dto.response;

import com.nhom10.library.entity.Review;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {

    private Long id;
    private Long userId;
    private String username;
    private String avatarUrl;

    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
            .id(review.getId())
            .userId(review.getUser().getId())
            // Fallback sang email nếu họ chưa có username
            .username(review.getUser().getUsername() != null ? review.getUser().getUsername() : review.getUser().getEmail())
            .avatarUrl(review.getUser().getAvatarUrl())
            .rating(review.getRating())
            .comment(review.getComment())
            .createdAt(review.getCreatedAt())
            .updatedAt(review.getUpdatedAt())
            .build();
    }
}
