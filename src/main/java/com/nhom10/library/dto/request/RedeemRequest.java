package com.nhom10.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RedeemRequest {
    @NotNull(message = "Vui lòng chọn phần thưởng")
    private Long rewardId;
}
