package com.crm.backend.controller;

import com.crm.backend.model.Role;
import com.crm.backend.model.User;
import com.crm.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        if (userRepository.findByUsername(body.get("username")) != null)
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        if (userRepository.findByEmail(body.get("email")) != null)
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));

        User user = new User();
        user.setUsername(body.get("username"));
        user.setEmail(body.get("email"));
        user.setPassword(encoder.encode(body.get("password")));
        user.setRole(Role.valueOf(body.get("role")));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(user -> {
            if (body.get("username") != null) user.setUsername(body.get("username"));
            if (body.get("email") != null) user.setEmail(body.get("email"));
            if (body.get("role") != null) user.setRole(Role.valueOf(body.get("role")));
            if (body.get("password") != null && !body.get("password").isBlank())
                user.setPassword(encoder.encode(body.get("password")));
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id))
            return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
    // Endpoint accessible par SALES et ADMIN pour lister les clients
    @GetMapping("/clients")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SALES', 'FINANCE')")
    public List<User> getClients() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole().name().equals("CLIENT"))
                .collect(java.util.stream.Collectors.toList());
    }
}