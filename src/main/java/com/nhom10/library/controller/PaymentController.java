package com.nhom10.library.controller;

import com.nhom10.library.service.VNPayService;
import com.nhom10.library.service.MoMoService;
import com.nhom10.library.service.SePayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * Controller xử lý mọi giao dịch Thanh toán điện tử (VNPay, MoMo, SePay).
 */
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VNPayService vnPayService;
    private final MoMoService moMoService;
    private final SePayService sePayService;

    // ==========================================
    // CỔNG CHUYỂN KHOẢN TỰ ĐỘNG - SEPAY
    // ==========================================

    /**
     * Frontend gọi lấy Link Ảnh QR Code để hiện lên Web cho người dùng quyét.
     * /api/payment/sepay-qr?amount=50000&orderInfo=UserA
     */
    @GetMapping("/sepay-qr")
    public ResponseEntity<?> createSePayQR(@RequestParam long amount, @RequestParam String orderInfo) {
        String qrLink = sePayService.generateVietQR(amount, orderInfo);
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Quét mã chuyển khoản từ các App Ngân Hàng/Ví.",
            "qr_link_image", qrLink,
            "bank_account_info", Map.of(
                "bank", "MBBank",
                "name", "NGUYEN DINH ANH TUAN",
                "number", "0398702156"
            )
        ));
    }

    /**
     * Nút "Đã Chuyển Khoản" trên web - Cầm token do bạn cấp check lên server SePay có tiền về chưa.
     */
    @GetMapping("/sepay-verify")
    public ResponseEntity<?> verifySePayTransaction(@RequestParam long amount, @RequestParam String orderInfo) {
        boolean isSuccess = sePayService.verifyTransaction(amount, orderInfo);
        
        if (isSuccess) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "Hệ thống đã nhận được tiền phạt. Bạn đã cấn trừ nợ xong!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Chưa tìm thấy lịch sử thanh toán. Đợi thêm 15 giây nếu bạn vừa chuyển."));
        }
    }

    /**
     * (Tùy Chọn Lên Điểm): Webhook - Callback Server to Server.
     * Cấu hình ném URL này (đã expose qua ngrok/server ảo) lên trang my.sepay.vn Webhook.
     */
    @PostMapping("/sepay-webhook")
    public ResponseEntity<?> sepayWebhookReceiver(@RequestBody Map<String, Object> payload) {
        log.info("==> Webhook SePay bắt được giao dịch Biến động số dư: {}", payload);
        // Tiến trình:
        // Lấy TransferContent = payload.get("content");
        // Tìm userId = parse(TransferContent);
        // Lưu DB -> Cộng tiền/Trừ nợ
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ==========================================
    // CỔNG VNPAY MẶC ĐỊNH
    // ==========================================
    
    @PostMapping("/vnpay-create")
    public ResponseEntity<?> createVNPayment(@RequestParam long amount, @RequestParam String orderInfo, HttpServletRequest request) {
        return ResponseEntity.ok(Map.of("url", vnPayService.createPaymentUrl(amount, orderInfo, request)));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnPayReturn(@RequestParam Map<String, String> queryParams) {
        String vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
        
        if ("00".equals(vnp_ResponseCode)) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "VNPay Thành công!", "data", queryParams));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "VNPay Lỗi/Hủy."));
        }
    }

    // ==========================================
    // CỔNG VÍ ĐIỆN TỬ MOMO E-WALLET
    // ==========================================

    @PostMapping("/momo-create")
    public ResponseEntity<?> createMoMoPayment(@RequestParam long amount, @RequestParam String orderInfo) {
        String paymentUrl = moMoService.createPaymentUrl(amount, orderInfo);
        if (paymentUrl != null) {
            return ResponseEntity.ok(Map.of("status", "success", "url", paymentUrl));
        }
        return ResponseEntity.internalServerError().body(Map.of("error", "MoMo server từ chối."));
    }

    @GetMapping("/momo-return")
    public ResponseEntity<?> moMoReturn(@RequestParam Map<String, String> queryParams) {
        String resultCode = queryParams.get("resultCode");
        
        if ("0".equals(resultCode)) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "MoMo thành công!", "data", queryParams));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "MoMo thất bại."));
        }
    }
}
