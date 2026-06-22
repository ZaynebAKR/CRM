package com.crm.backend.repository;

import com.crm.backend.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByClientId(Long clientId);
    List<Invoice> findByCreatedById(Long userId);
    Optional<Invoice> findTopByOrderByIdDesc();

    @Query("SELECT i FROM Invoice i WHERE i.client.id = :clientId ORDER BY i.createdAt DESC")
    List<Invoice> findByClientIdOrderByCreatedAtDesc(Long clientId);
}