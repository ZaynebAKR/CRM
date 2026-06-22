package com.crm.backend.service;

import com.crm.backend.dto.InvoiceRequest;
import com.crm.backend.model.Invoice;
import com.crm.backend.model.InvoiceItem;
import com.crm.backend.model.User;
import com.crm.backend.repository.InvoiceRepository;
import com.crm.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JavaMailSender mailSender;


    private String generateInvoiceNumber() {
        int year = LocalDate.now().getYear();
        return invoiceRepository.findTopByOrderByIdDesc()
                .map(last -> {
                    String[] parts = last.getInvoiceNumber().split("-");
                    int seq = Integer.parseInt(parts[2]) + 1;
                    return String.format("INV-%d-%04d", year, seq);
                })
                .orElse(String.format("INV-%d-0001", year));
    }

    public Invoice createInvoice(InvoiceRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User createdBy = userRepository.findByUsername(auth.getName());
        User client = userRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setClient(client);
        invoice.setCreatedBy(createdBy);
        invoice.setCurrency(request.getCurrency() != null ? request.getCurrency() : "EUR");
        invoice.setStatus("DRAFT");
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(request.getDueDate());
        invoice.setNotes(request.getNotes());
        invoice.setCreatedAt(LocalDateTime.now());

        List<InvoiceItem> items = request.getItems().stream().map(req -> {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setProductName(req.getProductName());
            item.setPartNumber(req.getPartNumber());
            item.setBillingCycle(req.getBillingCycle());
            item.setTerm(req.getTerm());
            item.setQuantity(req.getQuantity());
            item.setUnitPrice(req.getUnitPrice());
            item.setTotalPrice(req.getTotalPrice());
            return item;
        }).collect(Collectors.toList());

        invoice.setItems(items);
        invoice.setTotalAmount(
                items.stream()
                        .map(InvoiceItem::getTotalPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public List<Invoice> getMyInvoices() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName());
        return invoiceRepository.findByCreatedById(user.getId());
    }

    public List<Invoice> getClientInvoices(Long clientId) {
        return invoiceRepository.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    public Invoice updateStatus(Long id, String status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(status);
        Invoice saved = invoiceRepository.save(invoice);

        // Envoyer email quand status devient SENT
        if ("SENT".equals(status) && invoice.getClient() != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(invoice.getClient().getEmail());
                message.setSubject("Invoice " + invoice.getInvoiceNumber() + " - INSOMEA COMPUTER SOLUTIONS");
                message.setText(
                        "Dear " + invoice.getClient().getUsername() + ",\n\n" +
                                "Please find below the details of your invoice:\n\n" +
                                "Invoice Number : " + invoice.getInvoiceNumber() + "\n" +
                                "Issue Date     : " + invoice.getIssueDate() + "\n" +
                                "Due Date       : " + invoice.getDueDate() + "\n" +
                                "Total Amount   : " + invoice.getTotalAmount() + " " + invoice.getCurrency() + "\n\n" +
                                (invoice.getNotes() != null ? "Notes: " + invoice.getNotes() + "\n\n" : "") +
                                "Please log in to your client portal to view and pay your invoice.\n\n" +
                                "Best regards,\n" +
                                "INSOMEA COMPUTER SOLUTIONS\n" +
                                "info@insomea.com | +216 98 174 454"
                );
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Failed to send invoice email: " + e.getMessage());
            }
        }

        return saved;
    }

    public Invoice getById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }
}