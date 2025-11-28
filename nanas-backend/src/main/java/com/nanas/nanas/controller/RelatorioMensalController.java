package com.nanas.nanas.controller;

import com.nanas.nanas.dto.RelatorioMensalDTO;
import com.nanas.nanas.service.RelatorioMensalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RelatorioMensalController {

    private final RelatorioMensalService relatorioMensalService;

    @GetMapping("/mensal")
    public ResponseEntity<RelatorioMensalDTO> gerarRelatorioMensal(
            @RequestParam Integer ano,
            @RequestParam Integer mes,
            @RequestHeader("user_id") String firebaseUid
    ) {
        RelatorioMensalDTO relatorio = relatorioMensalService.gerarRelatorioMensal(firebaseUid, ano, mes);
        return ResponseEntity.ok(relatorio);
    }

    @GetMapping("/mensal/atual")
    public ResponseEntity<RelatorioMensalDTO> gerarRelatorioMesAtual(
            @RequestHeader("user_id") String firebaseUid
    ) {
        RelatorioMensalDTO relatorio = relatorioMensalService.gerarRelatorioMesAtual(firebaseUid);
        return ResponseEntity.ok(relatorio);
    }

}
