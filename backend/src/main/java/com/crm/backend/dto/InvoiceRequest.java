package com.crm.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequest {
    private Long clientId;
    private LocalDate dueDate;
    private String notes;
    private String currency;
    private List<InvoiceItemRequest> items;

    @Data
    public static class InvoiceItemRequest {
        private String productName;
        private String partNumber;
        private String billingCycle;
        private String term;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}