package com.crm.backend.repository;

import com.crm.backend.model.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface LicenseRepository extends JpaRepository<License, Long> {

    List<License> findByUserId(Long userId);

    List<License> findByStatus(String status);

    List<License> findByPaymentStatus(String paymentStatus);

    List<License> findByDeploymentStatus(String deploymentStatus);

    @Query("SELECT l FROM License l WHERE l.expiryDate BETWEEN :today AND :in30Days AND l.status = 'ACTIVE'")
    List<License> findExpiringLicenses(LocalDate today, LocalDate in30Days);

    @Query("SELECT l FROM License l WHERE l.expiryDate BETWEEN :today AND :targetDate " +
            "AND l.status = 'ACTIVE' AND (l.expiryReminderSent = false OR l.expiryReminderSent IS NULL)")
    List<License> findLicensesNeedingReminder(LocalDate today, LocalDate targetDate);
}