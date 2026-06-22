package com.crm.backend.controller;

import com.crm.backend.dto.InvoiceRequest;
import com.crm.backend.model.Invoice;
import com.crm.backend.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sales/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<Invoice> create(@RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.createInvoice(request));
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getMine() {
        return ResponseEntity.ok(invoiceService.getMyInvoices());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Invoice>> getAll() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Invoice>> getClientInvoices(@PathVariable Long clientId) {
        return ResponseEntity.ok(invoiceService.getClientInvoices(clientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(Map.of("message", "Invoice deleted"));
    }
}