package com.nhom10.library.dto.response;

import com.nhom10.library.entity.enums.MissionType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MissionResponse {
    private Long id;
    private String title;
    private String description;
    private Integer pointReward;
    private MissionType missionType;
    private Integer currentProgress;
    private Integer requirement;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
}
