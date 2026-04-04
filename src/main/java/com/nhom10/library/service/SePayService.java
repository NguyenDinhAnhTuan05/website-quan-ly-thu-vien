package com.nhom10.library.service;

import com.nhom10.library.config.SePayConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service tích hợp cổng thanh toán qua Chuyển Khoản Ngân Hàng (Tự động xác nhận).
 * Sử dụng API của SePay.vn để check biến động số dư.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SePayService {

    private final SePayConfig sePayConfig;
    private final RestTemplate restTemplate;

    /**
     * Tạo đường link trực tiếp đến ảnh VietQR Code với số tiền và nội dung chuyển khoản được định sẵn.
     * Đọc giả chỉ cần mở App Ngân hàng lên quét là tự điền đúng tiền và nội dung.
     */
    public String generateVietQR(long amount, String orderInfo) {
        // Encode ký tự khoảng trắng trong nội dung chuyển khoản nếu có
        String cleanOrderInfo = orderInfo.replaceAll("\\s+", "");
        
        // Link API tạo mã QR của VietQR chuẩn Napas
        return String.format("https://qr.sepay.vn/img?bank=%s&acc=%s&amount=%d&des=%s",
                sePayConfig.getBankName(),
                sePayConfig.getAccountNumber(), 
                amount, 
                cleanOrderInfo);
    }

    /**
     * Hàm gọi API Token của SePay để xem danh sách giao dịch Ngân Hàng gần nhất.
     * Dùng để check thủ công hoặc check định kỳ xem khách đã chuyển khoản thật chưa.
     */
    public boolean verifyTransaction(long amountExpected, String orderInfoExpected) {
        try {
            String url = "https://my.sepay.vn/userapi/transactions/list";

            HttpHeaders headers = new HttpHeaders();
            // Gắn Authorization header với API Token thật của tài khoản
            headers.set("Authorization", "Bearer " + sePayConfig.getApiToken());
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Lấy lịch sử giao dịch từ SePay qua Token thành công.");

                // Convert mảng dữ liệu trả về thành String (chỉ để demo tìm kiếm chuỗi nội dung)
                // Trong thực tế sẽ parse `transactions` array và tìm exact map `amount_in` == amountExpected.
                String transactionsJson = response.getBody().toString();
                
                // Nếu nội dung chuyển khoản và số tiền có nằm trên lịch sử Ngân Hàng -> Thanh toán thành công!
                if (transactionsJson.contains(orderInfoExpected) && transactionsJson.contains(String.valueOf(amountExpected))) {
                    return true;
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi kết nối tài khoản API SePay: {}", e.getMessage());
        }
        
        return false; // Chưa thấy thanh toán
    }
}
