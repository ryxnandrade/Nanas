package com.nanas.nanas.controller;

import com.nanas.nanas.dto.TransacaoRequest;
import com.nanas.nanas.dto.TransacaoResponse;
import com.nanas.nanas.service.TransacaoService;
import com.nanas.nanas.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * Controller para gerenciamento de transações do usuário.
 */
@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    private final TransacaoService transacaoService;
    private final AuthService authService;

    public TransacaoController(TransacaoService transacaoService, AuthService authService) {
        this.transacaoService = transacaoService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<TransacaoResponse> criarTransacao(
            @RequestHeader("user_id") String userId,
            @Valid @RequestBody TransacaoRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        TransacaoResponse response = transacaoService.criarTransacao(usuario.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TransacaoResponse>> listarTransacoes(
            @RequestHeader("user_id") String userId) {
        // user_id agora é OBRIGATÓRIO - não permite mais buscar todas as transações
        var usuario = authService.findByFirebaseUid(userId);
        List<TransacaoResponse> response = transacaoService.buscarTransacoesPorUsuario(usuario.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransacaoResponse> buscarTransacaoPorId(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id) {
        var usuario = authService.findByFirebaseUid(userId);
        TransacaoResponse response = transacaoService.buscarTransacaoPorId(usuario.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransacaoResponse> atualizarTransacao(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id,
            @Valid @RequestBody TransacaoRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        TransacaoResponse response = transacaoService.atualizarTransacao(usuario.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTransacao(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id) {
        var usuario = authService.findByFirebaseUid(userId);
        transacaoService.deletarTransacao(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
