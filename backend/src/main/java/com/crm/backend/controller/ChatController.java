package com.crm.backend.controller;

import com.crm.backend.dto.ChatRequest;
import com.crm.backend.dto.ChatResponse;
import com.crm.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String reply = chatService.getResponse(request);
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
