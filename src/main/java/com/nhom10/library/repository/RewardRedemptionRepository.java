package com.nhom10.library.repository;

import com.nhom10.library.entity.RewardRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {
    List<RewardRedemption> findByUserIdOrderByRedeemedAtDesc(Long userId);
}
