package com.nhom10.library.repository;

import com.nhom10.library.entity.UserSubscription;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    List<UserSubscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
    
    // Tìm gói đang kích hoạt mới nhất của user
    Optional<UserSubscription> findFirstByUserIdAndStatusOrderByEndDateDesc(Long userId, SubscriptionStatus status);

    // Admin: lấy tất cả đăng ký theo trạng thái (phân trang)
    Page<UserSubscription> findByStatus(SubscriptionStatus status, Pageable pageable);

    // Batch: lấy active subscriptions cho nhiều user cùng lúc
    @EntityGraph(attributePaths = {"plan"})
    List<UserSubscription> findByUserIdInAndStatus(Collection<Long> userIds, SubscriptionStatus status);
}
