package com.nhom10.library.dto.response;

import com.nhom10.library.entity.UserSubscription;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserSubscriptionResponse {

    private Long id;
    private SubscriptionPlanResponse plan;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private SubscriptionStatus status;
    private String paymentReference;
    private LocalDateTime createdAt;

    public static UserSubscriptionResponse from(UserSubscription sub) {
        return UserSubscriptionResponse.builder()
            .id(sub.getId())
            .plan(SubscriptionPlanResponse.from(sub.getPlan()))
            .startDate(sub.getStartDate())
            .endDate(sub.getEndDate())
            .status(sub.getStatus())
            .paymentReference(sub.getPaymentReference())
            .createdAt(sub.getCreatedAt())
            .build();
    }
}
