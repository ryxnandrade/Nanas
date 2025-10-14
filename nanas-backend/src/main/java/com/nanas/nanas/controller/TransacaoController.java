package com.nanas.nanas.controller;

import com.nanas.nanas.dto.TransacaoRequest;
import com.nanas.nanas.dto.TransacaoResponse;
import com.nanas.nanas.service.TransacaoService;
import com.nanas.nanas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes" )
@CrossOrigin(origins = "*")
public class TransacaoController {

    @Autowired
    private TransacaoService transacaoService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<TransacaoResponse> criarTransacao(
        @RequestHeader("user_id") String userId, 
        @RequestBody TransacaoRequest request
    ) {
        var usuario = authService.findByFirebaseUid(userId);
        TransacaoResponse response = transacaoService.criarTransacao(usuario.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TransacaoResponse>> listarTransacoes(
        @RequestHeader(value = "user_id", required = false) String userId 
    ) {
        if (userId != null && !userId.isEmpty()) {
            var usuario = authService.findByFirebaseUid(userId);
            List<TransacaoResponse> response = transacaoService.buscarTransacoesPorUsuario(usuario.getId());
            return ResponseEntity.ok(response);
        } else {
            List<TransacaoResponse> response = transacaoService.buscarTodasTransacoes();
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransacaoResponse> buscarTransacaoPorId(
        @RequestHeader("user_id") String userId, 
        @PathVariable Long id
    ) {
        var usuario = authService.findByFirebaseUid(userId);
        TransacaoResponse response = transacaoService.buscarTransacaoPorId(usuario.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransacaoResponse> atualizarTransacao(
        @RequestHeader("user_id") String userId, 
        @PathVariable Long id, 
        @RequestBody TransacaoRequest request
    ) {
        var usuario = authService.findByFirebaseUid(userId);
        TransacaoResponse response = transacaoService.atualizarTransacao(usuario.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTransacao(
        @RequestHeader("user_id") String userId, 
        @PathVariable Long id
    ) {
        var usuario = authService.findByFirebaseUid(userId);
        transacaoService.deletarTransacao(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
