package com.nhom10.library.controller;

import com.nhom10.library.entity.SubscriptionPlan;
import com.nhom10.library.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlan>> getPlans() {
        return ResponseEntity.ok(subscriptionService.getAllPlans());
    }

    /**
     * Endpoint giả lập kích hoạt gói (Thực tế sẽ gọi sau khi nhận callback từ VNPay/MoMo)
     */
    @PostMapping("/activate")
    public ResponseEntity<?> activate(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        Long planId = Long.valueOf(payload.get("planId").toString());
        String paymentRef = payload.get("paymentRef") != null ? payload.get("paymentRef").toString() : null;

        return ResponseEntity.ok(subscriptionService.subscribeUser(userId, planId, paymentRef));
    }
}
