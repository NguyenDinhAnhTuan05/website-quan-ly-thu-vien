package com.nhom10.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscribeRequest {

    @NotNull(message = "Vui lòng chọn gói đăng ký")
    private Long planId;

    /** Mã tham chiếu giao dịch (từ VNPay/MoMo/SePay — nullable với gói free) */
    private String paymentReference;
}
