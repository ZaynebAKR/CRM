package com.crm.backend.repository;

import com.crm.backend.model.AiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {
    List<AiAnalysis> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AiAnalysis> findByUserRoleOrderByCreatedAtDesc(String userRole);
    List<AiAnalysis> findAllByOrderByCreatedAtDesc();
}