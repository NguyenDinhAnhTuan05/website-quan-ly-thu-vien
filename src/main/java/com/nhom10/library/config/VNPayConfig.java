package com.nhom10.library.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Random;

/**
 * Cấu hình tham số Cổng Thanh Toán điện tử VNPay.
 * Dùng Sandbox credentials cho môi trường thử nghiệm.
 */
@Configuration
@Getter
public class VNPayConfig {
    
    @Value("${vnpay.tmn-code:Y2L8Y8E7}") // Mã website của Sandbox
    private String vnp_TmnCode;
    
    @Value("${vnpay.hash-secret:T2A5YV1JUK5X0Z7G7R2R9A3A7Y8F5P2Z}") // Mã bí mật Sandbox
    private String vnp_HashSecret;
    
    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnp_Url;
    
    @Value("${vnpay.return-url:http://localhost:8080/api/payment/vnpay-return}")
    private String vnp_ReturnUrl;

    /**
     * Thuật toán băm chữ ký (Secure Hash) để chống giả mạo transaction.
     */
    public String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    /** Helper sinh chuỗi số ngẫu nhiên cho Mã giao dịch (TxnRef) */
    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
