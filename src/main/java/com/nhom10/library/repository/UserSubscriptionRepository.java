package com.nhom10.library.repository;

import com.nhom10.library.entity.UserSubscription;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    List<UserSubscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
    
    // Tìm gói đang kích hoạt mới nhất của user
    Optional<UserSubscription> findFirstByUserIdAndStatusOrderByEndDateDesc(Long userId, SubscriptionStatus status);
}
