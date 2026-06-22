package com.crm.backend.controller;

import com.crm.backend.model.AiAnalysis;
import com.crm.backend.repository.AiAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-analysis")
public class AiAnalysisController {

    @Autowired
    private AiAnalysisRepository aiAnalysisRepository;

    @PostMapping("/save")
    public ResponseEntity<?> saveAnalysis(@RequestBody Map<String, Object> body) {
        AiAnalysis analysis = new AiAnalysis();
        analysis.setUserRole((String) body.get("userRole"));
        analysis.setUserId(Long.valueOf(body.get("userId").toString()));
        analysis.setUsername((String) body.get("username"));
        analysis.setInput((String) body.get("input"));
        analysis.setSummary((String) body.get("summary"));
        analysis.setRecommendationsCount((int) body.get("recommendationsCount"));
        analysis.setTotalCurrent(Double.parseDouble(body.get("totalCurrent").toString()));
        analysis.setTotalOptimized(Double.parseDouble(body.get("totalOptimized").toString()));
        analysis.setResultJson((String) body.get("resultJson"));

        AiAnalysis saved = aiAnalysisRepository.save(analysis);
        return ResponseEntity.ok(Map.of(
                "message", "Analysis saved successfully",
                "id", saved.getId()
        ));
    }

    @GetMapping("/all")
    public List<AiAnalysis> getAllAnalyses() {
        return aiAnalysisRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/user/{userId}")
    public List<AiAnalysis> getUserAnalyses(@PathVariable Long userId) {
        return aiAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/role/{role}")
    public List<AiAnalysis> getByRole(@PathVariable String role) {
        return aiAnalysisRepository.findByUserRoleOrderByCreatedAtDesc(role);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnalysis(@PathVariable Long id) {
        if (!aiAnalysisRepository.existsById(id))
            return ResponseEntity.notFound().build();
        aiAnalysisRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }


    @org.springframework.beans.factory.annotation.Value("${groq.api.key}")
    private String groqApiKey;

    @PostMapping("/ask")
    public ResponseEntity<?> askAi(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(message),
                "temperature", 0.3,
                "max_tokens", 1500
        );
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + groqApiKey);
        org.springframework.http.HttpEntity<Map<String, Object>> request =
                new org.springframework.http.HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> groqResponse = restTemplate.postForEntity(
                "https://api.groq.com/openai/v1/chat/completions",
                request,
                Map.class
        );
        List<Map<String, Object>> choices = (List<Map<String, Object>>) groqResponse.getBody().get("choices");
        Map<String, Object> firstChoice = choices.get(0);
        Map<String, Object> messageObj = (Map<String, Object>) firstChoice.get("message");
        String content = (String) messageObj.get("content");
        return ResponseEntity.ok(Map.of("content", content));
    }
}
