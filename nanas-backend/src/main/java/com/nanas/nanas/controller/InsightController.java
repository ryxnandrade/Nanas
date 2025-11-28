package com.nanas.nanas.controller;

import com.nanas.nanas.dto.InsightDTO;
import com.nanas.nanas.service.InsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InsightController {
    
    private final InsightService insightService;
    
  @GetMapping
public ResponseEntity<List<InsightDTO>> gerarInsights(
        @RequestHeader("user_id") String firebaseUid
) {
    List<InsightDTO> insights = insightService.gerarInsights(firebaseUid);
    return ResponseEntity.ok(insights);
}

}
