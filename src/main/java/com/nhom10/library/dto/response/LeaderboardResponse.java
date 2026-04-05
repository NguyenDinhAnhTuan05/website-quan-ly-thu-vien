package com.nhom10.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private Long userId;
    private String username;
    private String avatarUrl;
    private String membershipTier;
    private Integer monthlyPoints;
    private Integer rank;
}
