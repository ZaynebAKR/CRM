package com.crm.backend.service;

import com.crm.backend.config.JwtUtil;
import com.crm.backend.dto.RegisterRequest;
import com.crm.backend.model.Role;
import com.crm.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.crm.backend.model.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.Instant;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public User register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match!");
        }

        User existingUsername = userRepository.findByUsername(request.getUsername());
        if (existingUsername != null) throw new RuntimeException("Username already exists!");

        User existingEmail = userRepository.findByEmail(request.getEmail());
        if (existingEmail != null) throw new RuntimeException("Email already exists!");

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        Role role = Role.valueOf(request.getRole());
        if (role != Role.CLIENT) {
            throw new RuntimeException("Self-registration is only allowed for CLIENT role.");
        }
        user.setRole(role);
        return userRepository.save(user);
    }

    public String login(String username, String password, boolean rememberMe) {
        User user = userRepository.findByUsername(username);
        if (user != null && encoder.matches(password, user.getPassword())) {
            return jwtUtil.generateToken(username, user.getRole().name(), rememberMe);
        }
        return null;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmailIgnoreCase(email.trim());
        if (user == null) throw new RuntimeException("No account associated with this email");

        String code = String.format("%06d", (int)(Math.random() * 1000000));

        user.setResetToken(code);
        user.setResetTokenExpiry(Instant.now().plusSeconds(900));
        userRepository.save(user);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Password Reset - INSOMEA");
        message.setText(
                "Hello " + user.getUsername() + ",\n\n" +
                        "You requested a password reset.\n\n" +
                        "Your reset code is:\n\n" +
                        code + "\n\n" +
                        "This code expires in 15 minutes.\n\n" +
                        "Enter this code on the reset page to choose a new password.\n\n" +
                        "— The INSOMEA Team"
        );
        mailSender.send(message);
    }

    public void verifyResetCode(String code) {
        User user = userRepository.findByResetToken(code.trim());
        if (user == null) throw new RuntimeException("Code invalide");
        if (Instant.now().isAfter(user.getResetTokenExpiry())) {
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("Code expiré");
        }
    }

    public void resetPassword(String code, String newPassword) {
        User user = userRepository.findByResetToken(code.trim());
        if (user == null) throw new RuntimeException("Code invalide ou expiré");
        if (Instant.now().isAfter(user.getResetTokenExpiry())) {
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("Code expiré");
        }

        user.setPassword(encoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username);
        if (user == null) throw new RuntimeException("User not found");

        if (!encoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
    }

    public User updateProfile(String username, String name, String email) {
        User user = userRepository.findByUsername(username);
        if (user == null) throw new RuntimeException("User not found");

        if (email != null && !email.equals(user.getEmail())) {
            User existingEmail = userRepository.findByEmail(email);
            if (existingEmail != null) throw new RuntimeException("Email already exists");
            user.setEmail(email);
        }

        if (name != null && !name.equals(user.getUsername())) {
            User existingUsername = userRepository.findByUsername(name);
            if (existingUsername != null) throw new RuntimeException("Username already exists");
            user.setUsername(name);
        }

        return userRepository.save(user);
    }

    public String updateProfileImage(String username, String imageUrl) {
        User user = userRepository.findByUsername(username);
        if (user == null) throw new RuntimeException("User not found");
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }
}