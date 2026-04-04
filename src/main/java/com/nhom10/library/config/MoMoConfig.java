package com.nhom10.library.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Cấu hình tham số Cổng Thanh Toán MoMo.
 * Tích hợp dựa trên Open Source SDK của Ví MoMo (java-master).
 * Sử dụng tham số môi trường Test Môi trường (Sandbox) mặc định.
 */
@Configuration
@Getter
public class MoMoConfig {
    
    // Partner code cố định của môi trường Test
    @Value("${momo.partner-code:MOMOOJOI20200706}")
    private String partnerCode;
    
    @Value("${momo.access-key:iPXneGtwvVlZ7tQ9}")
    private String accessKey;
    
    @Value("${momo.secret-key:8tM7Mst42mG6Kk024yWeP4PymNmb4k2S}")
    private String secretKey;
    
    @Value("${momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String endpoint;
    
    @Value("${momo.return-url:http://localhost:8080/api/payment/momo-return}")
    private String returnUrl;
    
    @Value("${momo.notify-url:http://localhost:8080/api/payment/momo-notify}")
    private String notifyUrl;

    /**
     * Hàm băm HmacSHA256 theo chuẩn bảo mật của Momo.
     * Raw Data JSON sẽ được trộn với Secret Key gửi lến chứng thực phía Máy chủ MoMo.
     */
    public String generateHmacSHA256(String data, String key) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo chữ ký HmacSHA256 Momo", e);
        }
    }
}
