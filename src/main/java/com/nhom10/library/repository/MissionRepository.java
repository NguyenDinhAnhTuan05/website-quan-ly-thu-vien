package com.nhom10.library.repository;

import com.nhom10.library.entity.Mission;
import com.nhom10.library.entity.enums.MissionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByIsActiveTrue();
    List<Mission> findByIsActiveTrueAndMissionType(MissionType missionType);
}
