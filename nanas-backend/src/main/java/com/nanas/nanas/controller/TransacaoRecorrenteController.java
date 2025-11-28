package com.nanas.nanas.controller;

import com.nanas.nanas.dto.TransacaoRecorrenteRequest;
import com.nanas.nanas.dto.TransacaoRecorrenteResponse;
import com.nanas.nanas.service.TransacaoRecorrenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/transacoes-recorrentes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransacaoRecorrenteController {

    private final TransacaoRecorrenteService transacaoRecorrenteService;

    @PostMapping
    public ResponseEntity<TransacaoRecorrenteResponse> criarTransacaoRecorrente(
            @RequestParam Long usuarioId,
            @Valid @RequestBody TransacaoRecorrenteRequest request) {

        TransacaoRecorrenteResponse response =
                transacaoRecorrenteService.criarTransacaoRecorrente(usuarioId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TransacaoRecorrenteResponse>> listarTransacoesRecorrentes(
            @RequestParam Long usuarioId) {

        List<TransacaoRecorrenteResponse> transacoes =
                transacaoRecorrenteService.listarTransacoesRecorrentes(usuarioId);

        return ResponseEntity.ok(transacoes);
    }

    @GetMapping("/ativas")
    public ResponseEntity<List<TransacaoRecorrenteResponse>> listarTransacoesRecorrentesAtivas(
            @RequestParam Long usuarioId) {

        List<TransacaoRecorrenteResponse> transacoes =
                transacaoRecorrenteService.listarTransacoesRecorrentesAtivas(usuarioId);

        return ResponseEntity.ok(transacoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransacaoRecorrenteResponse> buscarTransacaoRecorrentePorId(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {

        TransacaoRecorrenteResponse transacao =
                transacaoRecorrenteService.buscarTransacaoRecorrentePorId(usuarioId, id);

        return ResponseEntity.ok(transacao);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransacaoRecorrenteResponse> atualizarTransacaoRecorrente(
            @PathVariable Long id,
            @RequestParam Long usuarioId,
            @Valid @RequestBody TransacaoRecorrenteRequest request) {

        TransacaoRecorrenteResponse response =
                transacaoRecorrenteService.atualizarTransacaoRecorrente(usuarioId, id, request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTransacaoRecorrente(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {

        transacaoRecorrenteService.deletarTransacaoRecorrente(usuarioId, id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TransacaoRecorrenteResponse> alterarStatusTransacaoRecorrente(
            @PathVariable Long id,
            @RequestParam Boolean ativa,
            @RequestParam Long usuarioId) {

        TransacaoRecorrenteResponse response =
                transacaoRecorrenteService.alterarStatusTransacaoRecorrente(usuarioId, id, ativa);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/executar")
    public ResponseEntity<Void> executarTransacaoRecorrente(
            @PathVariable Long id) {

        transacaoRecorrenteService.executarTransacaoRecorrente(id);
        return ResponseEntity.ok().build();
    }
}
