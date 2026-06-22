package com.crm.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "invoice_items")
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "invoice_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Invoice invoice;

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
}