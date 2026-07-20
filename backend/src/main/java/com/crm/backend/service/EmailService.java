package com.crm.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendLicenseExpiryReminder(String toEmail, String username, String productName, LocalDate expiryDate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("⚠ Your license " + productName + " is expiring soon");
        message.setText(
                "Hello " + username + ",\n\n" +
                        "Your license \"" + productName + "\" will expire on " + expiryDate + ".\n" +
                        "Please renew it before this date to avoid any service interruption.\n\n" +
                        "Best regards,\nINSOMEA COMPUTER SOLUTIONS"
        );
        mailSender.send(message);
    }
}