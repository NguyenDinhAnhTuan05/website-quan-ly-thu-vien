package com.nhom10.library.service;

import com.nhom10.library.dto.response.UserSubscriptionResponse;
import com.nhom10.library.entity.SubscriptionPlan;
import com.nhom10.library.entity.User;
import com.nhom10.library.entity.UserSubscription;
import com.nhom10.library.entity.enums.MembershipTier;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import com.nhom10.library.repository.SubscriptionPlanRepository;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.UserRepository;
import com.nhom10.library.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;

    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findAll();
    }

    public SubscriptionPlan createPlan(SubscriptionPlan plan) {
        return planRepository.save(plan);
    }

    public SubscriptionPlan updatePlan(Long id, SubscriptionPlan updated) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gói không tồn tại"));
        plan.setName(updated.getName());
        plan.setDescription(updated.getDescription());
        plan.setPrice(updated.getPrice());
        plan.setDurationDays(updated.getDurationDays());
        plan.setMaxBorrowBooks(updated.getMaxBorrowBooks());
        return planRepository.save(plan);
    }

    public void deletePlan(Long id) {
        planRepository.deleteById(id);
    }

    /**
     * Tính toán giá ưu đãi dựa trên hạng thành viên tích điểm.
     */
    public double calculateDiscountedPrice(double originalPrice, String tier) {
        double discount = switch (tier) {
            case "GOLD" -> 0.15;   // Giảm 15%
            case "SILVER" -> 0.05; // Giảm 5%
            default -> 0.0;
        };
        return originalPrice * (1 - discount);
    }

    /**
     * Kich hoat goi cho nguoi dung sau khi thanh toan thanh cong.
     */
    @Transactional
    public UserSubscriptionResponse subscribeUser(Long userId, Long planId, String paymentRef) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nguoi dung"));

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Goi dang ky khong ton tai"));

        // ... (giữ nguyên logic kiểm tra hạ cấp) ...

        // Tao dang ky moi
        UserSubscription newSub = UserSubscription.builder()
                .user(user)
                .plan(plan)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
                .status(SubscriptionStatus.ACTIVE)
                .paymentReference(paymentRef)
                .build();

        // Thưởng thêm điểm khi mua gói Premium
        if (plan.getPrice().doubleValue() > 0) {
            user.setPoints(user.getPoints() + 500); // Thưởng 500 XP khi mua gói trả phí
        }
        
        userRepository.save(user);
        UserSubscription saved = userSubscriptionRepository.save(newSub);
        return UserSubscriptionResponse.from(saved);
    }

    /**
     * Lấy gói đăng ký đang active của user (nếu có).
     */
    @Transactional(readOnly = true)
    public UserSubscriptionResponse getCurrentSubscription(Long userId) {
        return userSubscriptionRepository
                .findFirstByUserIdAndStatusOrderByEndDateDesc(userId, SubscriptionStatus.ACTIVE)
                .map(UserSubscriptionResponse::from)
                .orElse(null);
    }

    /**
     * Admin: Lấy danh sách tất cả đăng ký gói thành viên (phân trang, lọc theo status).
     */
    @Transactional(readOnly = true)
    public Page<UserSubscriptionResponse> getAllUserSubscriptions(SubscriptionStatus status, Pageable pageable) {
        Page<UserSubscription> page;
        if (status != null) {
            page = userSubscriptionRepository.findByStatus(status, pageable);
        } else {
            page = userSubscriptionRepository.findAll(pageable);
        }
        return page.map(UserSubscriptionResponse::from);
    }
}