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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${app.upload.dir:${user.home}/insomea-uploads}")
    private String uploadDir;

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
                    user.getId(),
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
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            authService.changePassword(username, body.get("currentPassword"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String oldUsername = jwtUtil.extractUsername(token);

            User updated = authService.updateProfile(oldUsername, body.get("name"), body.get("email"));

            // Le username a pu changer -> il faut un nouveau token valide
            String newToken = jwtUtil.generateToken(updated.getUsername(), updated.getRole().name(), true);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated successfully",
                    "token", newToken,
                    "username", updated.getUsername(),
                    "email", updated.getEmail(),
                    "profileImageUrl", updated.getProfileImageUrl() != null ? updated.getProfileImageUrl() : ""
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/upload-profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);

            if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Fichier invalide, une image est attendue."));
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "Image trop volumineuse (max 5MB)."));
            }

            Path dirPath = Paths.get(uploadDir, "profiles");
            Files.createDirectories(dirPath);

            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + "." + extension;
            Path filePath = dirPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/uploads/profiles/" + filename;
            authService.updateProfileImage(username, imageUrl);

            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Erreur lors de l'upload."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            User user = authService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }
            return ResponseEntity.ok(Map.of(
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole().name(),
                    "profileImageUrl", user.getProfileImageUrl() != null ? user.getProfileImageUrl() : ""
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}