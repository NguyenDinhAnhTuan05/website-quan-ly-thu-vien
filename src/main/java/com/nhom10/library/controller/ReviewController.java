package com.nhom10.library.controller;

import com.nhom10.library.dto.request.ReviewRequest;
import com.nhom10.library.dto.response.ReviewResponse;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books/{bookId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Bất kì ai cũng có thể XEM danh sách reviews của 1 cuốn sách
    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getReviewsOfBook(
            @PathVariable Long bookId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId, pageable));
    }

    // Auth yêu cầu: Dùng token JWT thì AuthenticationPrincipal sẽ lấy ra đc ID User
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ReviewResponse> addOrUpdateReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long bookId,
            @Valid @RequestBody ReviewRequest request) {

        ReviewResponse response = reviewService.addOrUpdateReview(principal.getId(), bookId, request);
        return ResponseEntity.ok(response);
    }

    // Xóa đánh giá — chỉ chủ sở hữu mới có quyền
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long bookId,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(principal.getId(), reviewId);
        return ResponseEntity.noContent().build();
    }
}
