package com.nhom10.library.service;

import com.nhom10.library.dto.response.UserSubscriptionResponse;
import com.nhom10.library.entity.SubscriptionPlan;
import com.nhom10.library.entity.User;
import com.nhom10.library.entity.UserSubscription;
import com.nhom10.library.entity.enums.MembershipTier;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import com.nhom10.library.repository.SubscriptionPlanRepository;
import com.nhom10.library.repository.UserRepository;
import com.nhom10.library.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
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

    /**
     * Kich hoat goi cho nguoi dung sau khi thanh toan thanh cong.
     * Tra ve DTO de tranh LazyInitializationException khi Jackson serialize.
     */
    @Transactional
    public UserSubscriptionResponse subscribeUser(Long userId, Long planId, String paymentRef) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Goi dang ky khong ton tai"));

        // Huy cac goi cu dang active (neu co)
        userSubscriptionRepository.findFirstByUserIdAndStatusOrderByEndDateDesc(userId, SubscriptionStatus.ACTIVE)
                .ifPresent(oldSub -> {
                    oldSub.setStatus(SubscriptionStatus.CANCELLED);
                    userSubscriptionRepository.save(oldSub);
                });

        // Tao dang ky moi
        UserSubscription newSub = UserSubscription.builder()
                .user(user)
                .plan(plan)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
                .status(SubscriptionStatus.ACTIVE)
                .paymentReference(paymentRef)
                .build();

        // Nang cap hang thanh vien cho User
        if (plan.getPrice().doubleValue() > 0) {
            user.setMembershipTier(MembershipTier.PREMIUM);
        } else {
            user.setMembershipTier(MembershipTier.BASIC);
        }

        // Tang diem thuong khi nang cap goi (vi du 100 diem)
        user.setPoints(user.getPoints() + 100);
        userRepository.save(user);

        // Convert sang DTO trong transaction (truoc khi session dong)
        UserSubscription saved = userSubscriptionRepository.save(newSub);
        return UserSubscriptionResponse.from(saved);
    }
}