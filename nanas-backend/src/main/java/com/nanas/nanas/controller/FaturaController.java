package com.nanas.nanas.controller;

import com.nanas.nanas.dto.TransacaoCartaoCreditoDTO;
import com.nanas.nanas.service.TransacaoCartaoCreditoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faturas" ) 
public class FaturaController {

    private final TransacaoCartaoCreditoService transacaoService;

    @Autowired
    public FaturaController(TransacaoCartaoCreditoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @GetMapping("/cartao/{cartaoId}/atual")
    public ResponseEntity<List<TransacaoCartaoCreditoDTO>> getFaturaAtual(
            @PathVariable Long cartaoId,
            @RequestParam Long usuarioId) {

        List<TransacaoCartaoCreditoDTO> fatura = transacaoService.getFaturaAtual(cartaoId, usuarioId);
        return ResponseEntity.ok(fatura);
    }

    @GetMapping("/cartao/{cartaoId}/proxima")
    public ResponseEntity<List<TransacaoCartaoCreditoDTO>> getProximaFatura(
            @PathVariable Long cartaoId,
            @RequestParam Long usuarioId) {

        List<TransacaoCartaoCreditoDTO> fatura = transacaoService.getProximaFatura(cartaoId, usuarioId);
        return ResponseEntity.ok(fatura);
    }
}
