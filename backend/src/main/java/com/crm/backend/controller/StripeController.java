package com.crm.backend.controller;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
public class StripeController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> body) {
        try {
            Stripe.apiKey = stripeSecretKey;

            long amount = Math.round(Double.parseDouble(body.get("amount").toString()) * 100);
            String currency = body.getOrDefault("currency", "eur").toString().toLowerCase();
            String invoiceId = body.getOrDefault("invoiceId", "").toString();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency(currency)
                    .putMetadata("invoiceId", invoiceId)
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            return ResponseEntity.ok(Map.of("clientSecret", intent.getClientSecret()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}