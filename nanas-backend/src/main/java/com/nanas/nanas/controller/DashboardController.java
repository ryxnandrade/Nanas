package com.nanas.nanas.controller;

import com.nanas.nanas.dto.DespesaPorCategoriaDTO;
import com.nanas.nanas.dto.EvolucaoSaldoDTO;
import com.nanas.nanas.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@RequestParam Long usuarioId) {
        Map<String, Object> summary = dashboardService.getSummary(usuarioId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/despesas-por-categoria")
    public ResponseEntity<List<DespesaPorCategoriaDTO>> getDespesasPorCategoria(@RequestParam Long usuarioId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.withDayOfMonth(1); 
        List<DespesaPorCategoriaDTO> despesas = dashboardService.getDespesasPorCategoria(usuarioId, startDate, endDate);
        return ResponseEntity.ok(despesas);
    }

    @GetMapping("/evolucao-saldo")
    public ResponseEntity<List<EvolucaoSaldoDTO>> getEvolucaoSaldo(@RequestParam Long usuarioId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(6);
        List<EvolucaoSaldoDTO> evolucao = dashboardService.getEvolucaoSaldo(usuarioId, startDate, endDate, null); 
        return ResponseEntity.ok(evolucao);
    }
}
