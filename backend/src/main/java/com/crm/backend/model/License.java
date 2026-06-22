package com.crm.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "licenses")
public class License {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "part_number")
    private String partNumber;

    @Column(name = "billing_cycle")
    private String billingCycle;

    private String term;

    private Integer quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    private String currency;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    private String status;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "deployment_status")
    private String deploymentStatus = "NOT_STARTED";

    @Column(name = "deployment_note")
    private String deploymentNote;
}