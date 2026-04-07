package com.nhom10.library.controller;

import com.nhom10.library.dto.request.RedeemRequest;
import com.nhom10.library.dto.response.*;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.GamificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/summary")
    public ApiResponse<PointSummaryResponse> getPointSummary(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ApiResponse.success(gamificationService.getPointSummary(currentUser.getId()));
    }

    @GetMapping("/missions")
    public ApiResponse<List<MissionResponse>> getMissions(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ApiResponse.success(gamificationService.getMissionsByUser(currentUser.getId()));
    }

    @GetMapping("/transactions")
    public ApiResponse<List<PointTransactionResponse>> getTransactions(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ApiResponse.success(gamificationService.getTransactionsByUser(currentUser.getId()));
    }

    @PostMapping("/daily-check-in")
    public ApiResponse<String> dailyCheckIn(@AuthenticationPrincipal UserPrincipal currentUser) {
        gamificationService.dailyCheckIn(currentUser.getId());
        return ApiResponse.success("Điểm danh thành công! Bạn đã nhận được 10 điểm.");
    }

    // ======================== REWARDS ========================

    @GetMapping("/rewards")
    public ApiResponse<List<RewardResponse>> getRewards(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ApiResponse.success(gamificationService.getAvailableRewards(currentUser.getId()));
    }

    @PostMapping("/redeem")
    public ApiResponse<RewardRedemptionResponse> redeemReward(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody RedeemRequest request) {
        return ApiResponse.success(gamificationService.redeemReward(currentUser.getId(), request.getRewardId()));
    }

    @GetMapping("/redemption-history")
    public ApiResponse<List<RewardRedemptionResponse>> getRedemptionHistory(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ApiResponse.success(gamificationService.getRedemptionHistory(currentUser.getId()));
    }

    // ======================== LEADERBOARD ========================

    @GetMapping("/leaderboard")
    public ApiResponse<List<LeaderboardResponse>> getLeaderboard() {
        return ApiResponse.success(gamificationService.getMonthlyLeaderboard());
    }
}
