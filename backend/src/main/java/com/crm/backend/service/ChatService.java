package com.crm.backend.service;

import com.crm.backend.dto.ChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ChatService {

    @Value("${groq.api.key}")
    private String apiKey;

    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    public String getResponse(ChatRequest request) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        List<Map<String, String>> messages = new ArrayList<>();

        // Add system prompt as first message
        messages.add(Map.of(
                "role", "system",
                "content", request.getSystemPrompt()
        ));

        if (request.getMessages() != null) {
            for (ChatRequest.Message msg : request.getMessages()) {
                messages.add(Map.of(
                        "role", msg.getRole().equals("assistant") ? "assistant" : "user",
                        "content", msg.getContent()
                ));
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama-3.3-70b-versatile");
        body.put("messages", messages);
        body.put("temperature", 0.7);
        body.put("max_tokens", 1024);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            System.out.println(" Calling Groq API...");

            ResponseEntity<Map> response = restTemplate.exchange(
                    GROQ_URL,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            System.out.println(" Groq response received!");

            if (responseBody != null) {
                List<Map<String, Object>> choices =
                        (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> message =
                            (Map<String, String>) choice.get("message");
                    if (message != null) {
                        return message.get("content");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println(" Groq API error: " + e.getMessage());
            throw new RuntimeException("Groq API error: " + e.getMessage(), e);
        }

        return "Sorry, I could not process your request. Please try again.";
    }
}