package com.nhom10.library.entity;

import com.nhom10.library.entity.enums.RewardType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rewards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    @Builder.Default
    private String icon = "🎁";

    @Column(name = "point_cost", nullable = false)
    private Integer pointCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "reward_type", nullable = false, length = 50)
    private RewardType rewardType;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = -1;

    @Column(name = "validity_days")
    private Integer validityDays;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
