package com.crm.backend.controller;

import com.crm.backend.model.License;
import com.crm.backend.service.LicenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/licenses")
public class LicenseController {

    @Autowired
    private LicenseService licenseService;

    @GetMapping("/my")
    public ResponseEntity<List<License>> getMyLicenses(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(licenseService.getMyLicenses(username));
    }

    @GetMapping("/all")
    public ResponseEntity<List<License>> getAllLicenses() {
        return ResponseEntity.ok(licenseService.getAllLicenses());
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<License>> getExpiringLicenses() {
        return ResponseEntity.ok(licenseService.getExpiringLicenses());
    }

    @PostMapping("/request")
    public ResponseEntity<License> requestLicense(
            @RequestBody License license,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(licenseService.requestLicense(license, username));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<License> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(licenseService.updateStatus(id, body.get("status")));
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<License> updatePayment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(licenseService.updatePaymentStatus(id, body.get("paymentStatus")));
    }
    @GetMapping("/tech/all")
    public ResponseEntity<List<License>> getAllForTech() {
        return ResponseEntity.ok(licenseService.getAllForTech());
    }

    @PutMapping("/tech/{id}/deployment")
    public ResponseEntity<License> updateDeployment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(licenseService.updateDeploymentStatus(
                id, body.get("deploymentStatus"), body.get("note")
        ));
    }
}