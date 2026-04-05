package com.nhom10.library.dto.response;

import com.nhom10.library.entity.enums.PointActionType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PointTransactionResponse {
    private Long id;
    private Integer amount;
    private PointActionType actionType;
    private String description;
    private LocalDateTime createdAt;
}
