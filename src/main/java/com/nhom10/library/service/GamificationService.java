package com.nhom10.library.service;

import com.nhom10.library.dto.response.*;
import com.nhom10.library.entity.*;
import com.nhom10.library.entity.enums.MembershipTier;
import com.nhom10.library.entity.enums.PointActionType;
import com.nhom10.library.entity.enums.RewardType;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import com.nhom10.library.event.GamificationEvent;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom10.library.entity.enums.MissionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final UserRepository userRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final MissionRepository missionRepository;
    private final UserMissionRepository userMissionRepository;
    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository rewardRedemptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    @EventListener
    @Transactional
    public void handleGamificationEvent(GamificationEvent event) {
        log.info("Processing GamificationEvent for user {}: action={}", event.getUser().getEmail(), event.getActionType());
        
        // Tính điểm cơ bản
        int basePoints = calculateBasePoints(event.getActionType());
        
        // Áp dụng hệ số nhân dựa trên hạng thành viên (Tier Multiplier)
        int finalPoints = applyTierMultiplier(event.getUser().getMembershipTier(), basePoints);
        
        addPointsToUser(event.getUser(), finalPoints, event.getActionType(), event.getReferenceId(), event.getDescription());
        
        // Cập nhật tiến độ nhiệm vụ liên quan
        updateMissionProgress(event.getUser(), event.getActionType());
    }

    @Transactional(readOnly = true)
    public PointSummaryResponse getPointSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        int nextTierPoints = getNextTierPoints(user.getMembershipTier());
        int currentPoints = user.getPoints();
        double progress = (nextTierPoints == 0) ? 100.0 : (double) currentPoints / nextTierPoints * 100;

        return PointSummaryResponse.builder()
                .currentPoints(currentPoints)
                .membershipTier(user.getMembershipTier().name())
                .pointsToNextTier(Math.max(0, nextTierPoints - currentPoints))
                .progressPercentage(Math.min(100.0, progress))
                .totalMissionsCompleted((int) userMissionRepository.findByUserId(userId).stream()
                        .filter(UserMission::isCompleted).count())
                .build();
    }

    @Transactional(readOnly = true)
    public List<MissionResponse> getMissionsByUser(Long userId) {
        List<Mission> activeMissions = missionRepository.findByIsActiveTrue();
        return activeMissions.stream().map(mission -> {
            UserMission userMission = userMissionRepository.findByUserIdAndMissionId(userId, mission.getId())
                    .orElse(null);

            // Qua ngày mới → reset tất cả nhiệm vụ
            int progress = 0;
            boolean completed = false;
            LocalDateTime completedAt = null;
            if (userMission != null) {
                if (userMission.isCompleted() && userMission.getCompletedAt() != null
                        && userMission.getCompletedAt().toLocalDate().isBefore(LocalDate.now())) {
                    progress = 0;
                    completed = false;
                } else {
                    progress = userMission.getCurrentProgress();
                    completed = userMission.isCompleted();
                    completedAt = userMission.getCompletedAt();
                }
            }

            return MissionResponse.builder()
                    .id(mission.getId())
                    .title(mission.getTitle())
                    .description(mission.getDescription())
                    .pointReward(mission.getPointReward())
                    .missionType(mission.getMissionType())
                    .currentProgress(progress)
                    .requirement(mission.getRequirement())
                    .isCompleted(completed)
                    .completedAt(completedAt)
                    .build();
        }).collect(Collectors.toList());
    }
@Transactional(readOnly = true)
public List<LeaderboardResponse> getMonthlyLeaderboard() {
    LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
    LocalDateTime startDateTime = startOfMonth.atStartOfDay();

    // Lấy tất cả giao dịch điểm dương trong tháng
    List<PointTransaction> transactions = pointTransactionRepository.findAll().stream()
            .filter(t -> t.getCreatedAt().isAfter(startDateTime))
            .filter(t -> t.getAmount() > 0)
            .collect(Collectors.toList());

    // Gom nhóm theo User và tính tổng điểm
    Map<Long, Integer> userPointsMap = transactions.stream()
            .collect(Collectors.groupingBy(t -> t.getUser().getId(),
                    Collectors.summingInt(PointTransaction::getAmount)));

    // Lấy tất cả user, gắn điểm tháng (0 nếu chưa có)
    List<LeaderboardResponse> leaderboard = userRepository.findAll().stream()
            .map(u -> LeaderboardResponse.builder()
                    .userId(u.getId())
                    .username(u.getUsername() != null ? u.getUsername() : u.getEmail())
                    .avatarUrl(u.getAvatarUrl())
                    .membershipTier(u.getMembershipTier().toString())
                    .monthlyPoints(userPointsMap.getOrDefault(u.getId(), 0))
                    .build())
            .sorted((a, b) -> Integer.compare(b.getMonthlyPoints(), a.getMonthlyPoints()))
            .limit(20)
            .collect(Collectors.toList());

    // Gán Rank
    for (int i = 0; i < leaderboard.size(); i++) {
        leaderboard.get(i).setRank(i + 1);
    }

    return leaderboard;
}

@Transactional(readOnly = true)
    public List<PointTransactionResponse> getTransactionsByUser(Long userId) {
        return pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(t -> PointTransactionResponse.builder()
                        .id(t.getId())
                        .amount(t.getAmount())
                        .actionType(t.getActionType())
                        .description(t.getDescription())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void dailyCheckIn(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean alreadyCheckedIn = pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .anyMatch(t -> t.getActionType() == PointActionType.CHECK_IN && 
                          t.getCreatedAt().toLocalDate().equals(LocalDate.now()));

        if (alreadyCheckedIn) {
            throw new BadRequestException("Bạn đã điểm danh hôm nay rồi.");
        }

        handleGamificationEvent(new GamificationEvent(this, user, PointActionType.CHECK_IN, null, "Điểm danh hàng ngày"));
    }

    // ======================== REWARD SYSTEM ========================

    @Transactional(readOnly = true)
    public List<RewardResponse> getAvailableRewards(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        return rewardRepository.findByIsActiveTrue().stream()
                .map(reward -> RewardResponse.from(reward, user.getPoints()))
                .collect(Collectors.toList());
    }

    @Transactional
    public RewardRedemptionResponse redeemReward(Long userId, Long rewardId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward", "id", rewardId));

        if (!reward.isActive()) {
            throw new BadRequestException("Phần thưởng này không còn khả dụng.");
        }

        if (reward.getStock() != -1 && reward.getStock() <= 0) {
            throw new BadRequestException("Phần thưởng này đã hết số lượng.");
        }

        if (user.getPoints() < reward.getPointCost()) {
            throw new BadRequestException("Bạn không đủ điểm để đổi phần thưởng này. Cần " + reward.getPointCost() + " XP, hiện có " + user.getPoints() + " XP.");
        }

        // Trừ điểm
        user.setPoints(user.getPoints() - reward.getPointCost());
        updateMembershipTier(user);
        userRepository.save(user);

        // Ghi lịch sử giao dịch điểm (số âm)
        PointTransaction transaction = PointTransaction.builder()
                .user(user)
                .amount(-reward.getPointCost())
                .actionType(PointActionType.REDEEM_SUBSCRIPTION)
                .referenceId(reward.getId().toString())
                .description("Đổi điểm: " + reward.getName())
                .build();
        pointTransactionRepository.save(transaction);

        // Giảm stock nếu có giới hạn  
        if (reward.getStock() != -1) {
            reward.setStock(reward.getStock() - 1);
            rewardRepository.save(reward);
        }

        // Xử lý theo loại phần thưởng
        processRewardByType(user, reward);

        // Ghi lịch sử đổi thưởng
        LocalDateTime expiresAt = reward.getValidityDays() != null
                ? LocalDateTime.now().plusDays(reward.getValidityDays())
                : null;

        RewardRedemption redemption = RewardRedemption.builder()
                .user(user)
                .reward(reward)
                .pointsSpent(reward.getPointCost())
                .status("COMPLETED")
                .expiresAt(expiresAt)
                .build();
        rewardRedemptionRepository.save(redemption);

        log.info("User {} redeemed reward '{}' for {} points", user.getEmail(), reward.getName(), reward.getPointCost());

        return RewardRedemptionResponse.from(redemption);
    }

    @Transactional(readOnly = true)
    public List<RewardRedemptionResponse> getRedemptionHistory(Long userId) {
        return rewardRedemptionRepository.findByUserIdOrderByRedeemedAtDesc(userId)
                .stream()
                .map(RewardRedemptionResponse::from)
                .collect(Collectors.toList());
    }

    private void processRewardByType(User user, Reward reward) {
        switch (reward.getRewardType()) {
            case SUBSCRIPTION -> {
                Long planId = Long.valueOf(reward.getReferenceId());
                SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                        .orElseThrow(() -> new BadRequestException("Gói đăng ký không tồn tại."));
                
                UserSubscription newSub = UserSubscription.builder()
                        .user(user)
                        .plan(plan)
                        .startDate(LocalDateTime.now())
                        .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
                        .status(SubscriptionStatus.ACTIVE)
                        .paymentReference("POINT_REDEEM_" + System.currentTimeMillis())
                        .build();
                userSubscriptionRepository.save(newSub);
                log.info("Activated subscription plan '{}' for user {}", plan.getName(), user.getEmail());
            }
            case EXTRA_BORROW -> {
                log.info("Granted extra borrow slots to user {}", user.getEmail());
            }
            case DISCOUNT -> {
                log.info("Granted discount code to user {}", user.getEmail());
            }
            case BADGE -> {
                user.setBadge(reward.getReferenceId());
                userRepository.save(user);
                log.info("Granted badge '{}' to user {}", reward.getReferenceId(), user.getEmail());
            }
        }
    }

    // ======================== HELPER METHODS ========================

    private int applyTierMultiplier(MembershipTier tier, int points) {
        return switch (tier) {
            case GOLD   -> (int) (points * 1.5);
            case SILVER -> (int) (points * 1.2);
            default     -> points;
        };
    }

    private int calculateBasePoints(PointActionType actionType) {
        return switch (actionType) {
            case CHECK_IN -> 50;
            case READ_BOOK -> 100;
            case REVIEW_BOOK -> 20;
            case BORROW_BOOK -> 5;
            case RETURN_BOOK_ON_TIME -> 30;
            default -> 0;
        };
    }

    private void addPointsToUser(User user, int points, PointActionType actionType, String referenceId, String description) {
        user.setPoints(user.getPoints() + points);
        updateMembershipTier(user);
        userRepository.save(user);

        PointTransaction transaction = PointTransaction.builder()
                .user(user)
                .amount(points)
                .actionType(actionType)
                .referenceId(referenceId)
                .description(description)
                .build();
        pointTransactionRepository.save(transaction);
    }

    private void updateMissionProgress(User user, PointActionType actionType) {
        List<Mission> activeMissions = missionRepository.findByIsActiveTrue();
        
        for (Mission mission : activeMissions) {
            if (isMissionRelatedToAction(mission, actionType)) {
                UserMission userMission = userMissionRepository.findByUserIdAndMissionId(user.getId(), mission.getId())
                        .orElse(UserMission.builder()
                                .user(user)
                                .mission(mission)
                                .currentProgress(0)
                                .isCompleted(false)
                                .build());

                // Qua ngày mới → reset tất cả nhiệm vụ
                if (userMission.isCompleted()
                        && userMission.getCompletedAt() != null
                        && userMission.getCompletedAt().toLocalDate().isBefore(LocalDate.now())) {
                    userMission.setCompleted(false);
                    userMission.setCurrentProgress(0);
                    userMission.setCompletedAt(null);
                }

                if (!userMission.isCompleted()) {
                    userMission.setCurrentProgress(userMission.getCurrentProgress() + 1);
                    
                    if (userMission.getCurrentProgress() >= mission.getRequirement()) {
                        userMission.setCompleted(true);
                        userMission.setCompletedAt(LocalDateTime.now());
                        
                        addPointsToUser(user, mission.getPointReward(), PointActionType.CHECK_IN, 
                                mission.getId().toString(), "Hoàn thành nhiệm vụ: " + mission.getTitle());
                    }
                    userMissionRepository.save(userMission);
                }
            }
        }
    }

    private boolean isMissionRelatedToAction(Mission mission, PointActionType actionType) {
        String title = mission.getTitle().toLowerCase();
        return switch (actionType) {
            case CHECK_IN -> title.contains("điểm danh");
            case READ_BOOK -> title.contains("đọc") || title.contains("sách mới");
            case REVIEW_BOOK -> title.contains("đánh giá");
            default -> false;
        };
    }

    private void updateMembershipTier(User user) {
        int points = user.getPoints();
        if (points >= 1000) user.setMembershipTier(MembershipTier.GOLD);
        else if (points >= 500) user.setMembershipTier(MembershipTier.SILVER);
        else user.setMembershipTier(MembershipTier.BRONZE);
    }

    private int getNextTierPoints(MembershipTier currentTier) {
        return switch (currentTier) {
            case BRONZE -> 500;
            case SILVER -> 1000;
            case GOLD   -> 0;
        };
    }
}
