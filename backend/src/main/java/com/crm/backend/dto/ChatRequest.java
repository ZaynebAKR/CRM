package com.crm.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {
    private String systemPrompt;
    private List<Message> messages;

    @Data
    public static class Message {
        private String role;
        private String content;
    }
}
