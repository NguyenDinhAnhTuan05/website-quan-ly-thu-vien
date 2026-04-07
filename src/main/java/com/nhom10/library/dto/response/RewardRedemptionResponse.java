package com.nhom10.library.dto.response;

import com.nhom10.library.entity.RewardRedemption;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RewardRedemptionResponse {
    private Long id;
    private String rewardName;
    private String rewardIcon;
    private Integer pointsSpent;
    private String status;
    private LocalDateTime redeemedAt;
    private LocalDateTime expiresAt;
    private boolean expired;

    public static RewardRedemptionResponse from(RewardRedemption redemption) {
        LocalDateTime expiresAt = redemption.getExpiresAt();
        return RewardRedemptionResponse.builder()
                .id(redemption.getId())
                .rewardName(redemption.getReward().getName())
                .rewardIcon(redemption.getReward().getIcon())
                .pointsSpent(redemption.getPointsSpent())
                .status(redemption.getStatus())
                .redeemedAt(redemption.getRedeemedAt())
                .expiresAt(expiresAt)
                .expired(expiresAt != null && LocalDateTime.now().isAfter(expiresAt))
                .build();
    }
}
