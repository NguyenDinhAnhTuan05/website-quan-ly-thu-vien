package com.nhom10.library.repository;

import com.nhom10.library.entity.UserMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMissionRepository extends JpaRepository<UserMission, Long> {
    Optional<UserMission> findByUserIdAndMissionId(Long userId, Long missionId);
    List<UserMission> findByUserId(Long userId);
}
