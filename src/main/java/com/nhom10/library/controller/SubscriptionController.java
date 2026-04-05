package com.nhom10.library.controller;

import com.nhom10.library.dto.response.SubscriptionPlanResponse;
import com.nhom10.library.dto.response.UserSubscriptionResponse;
import com.nhom10.library.entity.SubscriptionPlan;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanResponse>> getPlans() {
        List<SubscriptionPlanResponse> plans = subscriptionService.getAllPlans()
                .stream().map(SubscriptionPlanResponse::from).toList();
        return ResponseEntity.ok(plans);
    }

    /** Lấy gói đăng ký đang active của user hiện tại — userId lấy từ JWT, không nhận từ client */
    @GetMapping("/my-subscription")
    public ResponseEntity<?> getMySubscription(@AuthenticationPrincipal UserPrincipal principal) {
        var sub = subscriptionService.getCurrentSubscription(principal.getId());
        return ResponseEntity.ok(sub); // null nếu chưa có gói active
    }

    /**
     * Kích hoạt gói — userId lấy từ JWT để chống IDOR.
     * Client chỉ gửi planId và paymentRef.
     */
    @PostMapping("/activate")
    public ResponseEntity<?> activate(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> payload) {
        Long planId = Long.valueOf(payload.get("planId").toString());
        String paymentRef = payload.get("paymentRef") != null ? payload.get("paymentRef").toString() : null;

        return ResponseEntity.ok(subscriptionService.subscribeUser(principal.getId(), planId, paymentRef));
    }

    /** Tạo gói subscription mới (Admin only) */
    @PostMapping("/plans")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<SubscriptionPlanResponse> createPlan(@RequestBody SubscriptionPlan plan) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SubscriptionPlanResponse.from(subscriptionService.createPlan(plan)));
    }

    /** Cập nhật gói subscription (Admin only) */
    @PutMapping("/plans/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<SubscriptionPlanResponse> updatePlan(@PathVariable Long id, @RequestBody SubscriptionPlan plan) {
        return ResponseEntity.ok(SubscriptionPlanResponse.from(subscriptionService.updatePlan(id, plan)));
    }

    /** Xóa gói subscription (Admin only) */
    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        subscriptionService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    /** Lấy danh sách tất cả user subscriptions (Admin only) */
    @GetMapping("/admin/user-subscriptions")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Page<UserSubscriptionResponse>> getAllUserSubscriptions(
            @RequestParam(required = false) SubscriptionStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(subscriptionService.getAllUserSubscriptions(status, pageable));
    }
}
