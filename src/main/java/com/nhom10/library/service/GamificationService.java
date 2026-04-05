package com.nhom10.library.service;

import com.nhom10.library.dto.response.*;
import com.nhom10.library.entity.*;
import com.nhom10.library.entity.enums.MembershipTier;
import com.nhom10.library.entity.enums.PointActionType;
import com.nhom10.library.event.GamificationEvent;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

            return MissionResponse.builder()
                    .id(mission.getId())
                    .title(mission.getTitle())
                    .description(mission.getDescription())
                    .pointReward(mission.getPointReward())
                    .missionType(mission.getMissionType())
                    .currentProgress(userMission != null ? userMission.getCurrentProgress() : 0)
                    .requirement(mission.getRequirement())
                    .isCompleted(userMission != null && userMission.isCompleted())
                    .completedAt(userMission != null ? userMission.getCompletedAt() : null)
                    .build();
        }).collect(Collectors.toList());
    }
@Transactional(readOnly = true)
public List<LeaderboardResponse> getMonthlyLeaderboard() {
    LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
    LocalDateTime startDateTime = startOfMonth.atStartOfDay();

    // Lấy tất cả giao dịch điểm trong tháng
    List<PointTransaction> transactions = pointTransactionRepository.findAll().stream()
            .filter(t -> t.getCreatedAt().isAfter(startDateTime))
            .collect(Collectors.toList());

    // Gom nhóm theo User và tính tổng điểm
    Map<User, Integer> userPointsMap = transactions.stream()
            .collect(Collectors.groupingBy(PointTransaction::getUser, 
                    Collectors.summingInt(PointTransaction::getAmount)));

    // Chuyển sang DTO, sắp xếp và gán hạng
    List<LeaderboardResponse> leaderboard = userPointsMap.entrySet().stream()
            .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue())) // Giảm dần
            .limit(20) // Lấy Top 20
            .map(entry -> LeaderboardResponse.builder()
                    .userId(entry.getKey().getId())
                    .username(entry.getKey().getUsername() != null ? entry.getKey().getUsername() : entry.getKey().getEmail())
                    .avatarUrl(entry.getKey().getAvatarUrl())
                    .membershipTier(entry.getKey().getMembershipTier().toString())
                    .monthlyPoints(entry.getValue())
                    .build())
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

    private int applyTierMultiplier(MembershipTier tier, int points) {
        return switch (tier) {
            case GOLD   -> (int) (points * 1.5);   // Hạng Vàng nhận 150% điểm
            case SILVER -> (int) (points * 1.2);   // Hạng Bạc nhận 120% điểm
            default     -> points;                  // Hạng Đồng nhận 100% điểm
        };
    }

    private int calculateBasePoints(PointActionType actionType) {
        return switch (actionType) {
            case CHECK_IN -> 10;
            case READ_BOOK -> 50;
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
            case READ_BOOK -> title.contains("đọc");
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
