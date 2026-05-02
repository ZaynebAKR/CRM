package com.crm.backend.repository;

import com.crm.backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import com.crm.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);
    User findByEmailIgnoreCase(String email);
}