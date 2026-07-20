package com.crm.backend.service;

import com.crm.backend.model.License;
import com.crm.backend.model.User;
import com.crm.backend.repository.LicenseRepository;
import com.crm.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LicenseService {

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public List<License> getMyLicenses(String username) {
        User user = userRepository.findByUsername(username);
        return licenseRepository.findByUserId(user.getId());
    }

    public List<License> getAllLicenses() {
        return licenseRepository.findAll();
    }

    public List<License> getExpiringLicenses() {
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);
        return licenseRepository.findExpiringLicenses(today, in30Days);
    }

    public License requestLicense(License license, String username) {
        User user = userRepository.findByUsername(username);
        license.setUser(user);
        license.setStatus("ACTIVE");
        license.setPaymentStatus("PENDING");
        license.setCreatedAt(LocalDateTime.now());
        return licenseRepository.save(license);
    }

    public License updateStatus(Long id, String status) {
        License license = licenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("License not found"));
        license.setStatus(status);
        return licenseRepository.save(license);
    }

    public License updatePaymentStatus(Long id, String paymentStatus) {
        License license = licenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("License not found"));
        license.setPaymentStatus(paymentStatus);
        return licenseRepository.save(license);
    }

    public License updateDeploymentStatus(Long id, String deploymentStatus, String note) {
        License license = licenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("License not found"));
        license.setDeploymentStatus(deploymentStatus);
        if (note != null && !note.isBlank()) license.setDeploymentNote(note);
        return licenseRepository.save(license);
    }

    public License renewLicense(Long id, LocalDate newExpiryDate) {
        License license = licenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("License not found"));

        license.setExpiryDate(newExpiryDate);
        license.setExpiryReminderSent(false); 
        license.setStatus("ACTIVE");

        return licenseRepository.save(license);
    }

    public List<License> getAllForTech() {
        return licenseRepository.findAll();
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendExpiryReminders() {
        LocalDate today = LocalDate.now();
        LocalDate targetDate = today.plusDays(5);

        List<License> licenses = licenseRepository.findLicensesNeedingReminder(today, targetDate);

        for (License license : licenses) {
            User user = license.getUser();
            if (user != null && user.getEmail() != null) {
                try {
                    emailService.sendLicenseExpiryReminder(
                            user.getEmail(),
                            user.getUsername(),
                            license.getProductName(),
                            license.getExpiryDate()
                    );
                    license.setExpiryReminderSent(true);
                    licenseRepository.save(license);
                } catch (Exception e) {
                    System.err.println("Échec envoi email pour licence " + license.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}