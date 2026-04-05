package com.nhom10.library.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PointSummaryResponse {
    private Integer currentPoints;
    private String membershipTier;
    private Integer pointsToNextTier;
    private Double progressPercentage;
    private Integer totalMissionsCompleted;
}
