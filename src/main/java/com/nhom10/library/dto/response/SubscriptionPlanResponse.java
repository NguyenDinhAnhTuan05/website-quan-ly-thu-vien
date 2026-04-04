package com.nhom10.library.dto.response;

import com.nhom10.library.entity.SubscriptionPlan;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SubscriptionPlanResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int durationDays;
    private int maxBorrowBooks;
    private LocalDateTime createdAt;

    public static SubscriptionPlanResponse from(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
            .id(plan.getId())
            .name(plan.getName())
            .description(plan.getDescription())
            .price(plan.getPrice())
            .durationDays(plan.getDurationDays())
            .maxBorrowBooks(plan.getMaxBorrowBooks())
            .createdAt(plan.getCreatedAt())
            .build();
    }
}
