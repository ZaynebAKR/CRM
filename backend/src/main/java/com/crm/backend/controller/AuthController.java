package com.crm.backend.controller;

import com.crm.backend.config.JwtUtil;
import com.crm.backend.dto.AuthResponse;
import com.crm.backend.dto.LoginRequest;
import com.crm.backend.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.crm.backend.model.User;
import com.crm.backend.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getUsername(), request.getPassword(), request.isRememberMe());
        if (token != null) {
            User user = authService.findByUsername(request.getUsername());
            AuthResponse response = new AuthResponse(
                    user.getUsername(),
                    user.getRole().name(),
                    token,
                    request.isRememberMe()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            authService.requestPasswordReset(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "Reset link sent"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody Map<String, String> body) {
        try {
            authService.verifyResetCode(body.get("code"));
            return ResponseEntity.ok(Map.of("message", "Code valid"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            authService.resetPassword(
                    body.get("code"),
                    body.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}