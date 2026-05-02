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
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private Map<String, Object[]> resetCodes = new ConcurrentHashMap<>();

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
        user.setRole(Role.valueOf(request.getRole()));

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
        if (user == null) throw new RuntimeException("Aucun compte associé à cet email");

        String code = String.format("%06d", (int)(Math.random() * 1000000));
        Instant expiry = Instant.now().plusSeconds(900);
        resetCodes.put(code, new Object[]{ user.getUsername(), expiry });

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Réinitialisation de votre mot de passe - INSOMEA");
        message.setText(
                "Bonjour " + user.getUsername() + ",\n\n" +
                        "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                        "Votre code de réinitialisation est :\n\n" +
                        code + "\n\n" +
                        "Ce code expire dans 15 minutes.\n\n" +
                        "Entrez ce code sur la page de réinitialisation pour choisir un nouveau mot de passe.\n\n" +
                        "— L'équipe INSOMEA"
        );
        mailSender.send(message);
    }

    public void verifyResetCode(String code) {
        Object[] entry = resetCodes.get(code.trim());
        if (entry == null) throw new RuntimeException("Code invalide");
        Instant expiry = (Instant) entry[1];
        if (Instant.now().isAfter(expiry)) {
            resetCodes.remove(code.trim());
            throw new RuntimeException("Code expiré");
        }
    }

    public void resetPassword(String code, String newPassword) {
        Object[] entry = resetCodes.get(code.trim());
        if (entry == null) throw new RuntimeException("Code invalide ou expiré");

        Instant expiry = (Instant) entry[1];
        if (Instant.now().isAfter(expiry)) {
            resetCodes.remove(code.trim());
            throw new RuntimeException("Code expiré");
        }

        String username = (String) entry[0];
        User user = userRepository.findByUsername(username);
        if (user == null) throw new RuntimeException("Utilisateur introuvable");

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        resetCodes.remove(code.trim());
    }
}