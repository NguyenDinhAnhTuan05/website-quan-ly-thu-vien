package com.nhom10.library.service;

import com.nhom10.library.config.MoMoConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Xử lý Giao dịch ví điện tử MoMo.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MoMoService {

    private final MoMoConfig moMoConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Tạo đường link mở trên trình duyệt nhảy vào khung quét mã QR thanh toán của App MoMo.
     * Cần đúng cấu trúc Raw Data theo docs chính thức của MoMo.
     */
    public String createPaymentUrl(long amount, String orderInfo) {
        try {
            // Biến số ngẫu nhiên cho từng giao dịch riêng biệt để không lo trùng lặp request
            String orderId = UUID.randomUUID().toString();
            String requestId = UUID.randomUUID().toString();
            String requestType = "captureWallet"; // Loạt thanh toán QR ví quét cơ bản
            String extraData = "";
            String amountStr = String.valueOf(amount);

            // ==========================
            // 1. TẠO RA DỮ LIỆU THÔ ĐỂ KÝ
            // Dãy Parameter cố định, phải sắp xếp the Alpha-B thứ tự A -> Z.
            // ==========================
            String rawData = "accessKey=" + moMoConfig.getAccessKey() +
                    "&amount=" + amountStr +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + moMoConfig.getNotifyUrl() +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + moMoConfig.getPartnerCode() +
                    "&redirectUrl=" + moMoConfig.getReturnUrl() +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            // Ký số học bằng khóa Secret của tài khoản Momo Business
            String signature = moMoConfig.generateHmacSHA256(rawData, moMoConfig.getSecretKey());

            // ==========================
            // 2. TẠO REQUEST PAYLOAD
            // Đóng gói theo dạng Json
            // ==========================
            Map<String, Object> requestParams = new HashMap<>();
            requestParams.put("partnerCode", moMoConfig.getPartnerCode());
            requestParams.put("partnerName", "Thư Viện Trực Tuyến N10");
            requestParams.put("storeId", "MomoTestStore");
            requestParams.put("requestId", requestId);
            requestParams.put("amount", amountStr);  // VNPAY thì nhân 100, Momo thì giữ nguyên
            requestParams.put("orderId", orderId);
            requestParams.put("orderInfo", orderInfo);
            requestParams.put("redirectUrl", moMoConfig.getReturnUrl());
            requestParams.put("ipnUrl", moMoConfig.getNotifyUrl());
            requestParams.put("lang", "vi");
            requestParams.put("extraData", extraData);
            requestParams.put("requestType", requestType);
            requestParams.put("signature", signature);

            // ==========================
            // 3. SEND POST VÀ NHẬN LINK MOMO
            // ==========================
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestParams, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                moMoConfig.getEndpoint(), 
                requestEntity, 
                Map.class
            );
            
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("payUrl")) {
                log.info("Lập link mã QR thanh toán MoMo thành công cho Code: {}", orderId);
                return (String) responseBody.get("payUrl");
            } else {
                log.error("API MoMo báo lỗi từ chối: {}", responseBody);
                return null;
            }
            
        } catch (Exception e) {
            log.error("Có sự cố hệ thống lúc gửi request tới MoMo Server: {}", e.getMessage());
            return null;
        }
    }
}
