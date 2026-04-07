package com.nhom10.library.dto.response;

import com.nhom10.library.entity.Reward;
import com.nhom10.library.entity.enums.RewardType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RewardResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private Integer pointCost;
    private RewardType rewardType;
    private String referenceId;
    private Integer stock;
    private boolean canRedeem;
    private Integer validityDays;

    public static RewardResponse from(Reward reward, int userPoints) {
        return RewardResponse.builder()
                .id(reward.getId())
                .name(reward.getName())
                .description(reward.getDescription())
                .icon(reward.getIcon())
                .pointCost(reward.getPointCost())
                .rewardType(reward.getRewardType())
                .referenceId(reward.getReferenceId())
                .stock(reward.getStock())
                .canRedeem(userPoints >= reward.getPointCost() && (reward.getStock() == -1 || reward.getStock() > 0))
                .validityDays(reward.getValidityDays())
                .build();
    }
}
