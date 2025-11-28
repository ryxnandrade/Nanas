package com.nanas.nanas.controller;

import com.nanas.nanas.dto.MetaRequest;
import com.nanas.nanas.dto.MetaResponse;
import com.nanas.nanas.service.MetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/metas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetaController {

    private final MetaService metaService;

    @PostMapping
    public ResponseEntity<MetaResponse> criarMeta(
            @RequestParam Long usuarioId,
            @Valid @RequestBody MetaRequest request
    ) {
        MetaResponse response = metaService.criarMeta(usuarioId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MetaResponse>> listarMetas(@RequestParam Long usuarioId) {
        List<MetaResponse> metas = metaService.listarMetas(usuarioId);
        return ResponseEntity.ok(metas);
    }

    @GetMapping("/ativas")
    public ResponseEntity<List<MetaResponse>> listarMetasAtivas(
            @RequestParam Long usuarioId
    ) {
        List<MetaResponse> metas = metaService.listarMetasAtivas(usuarioId);
        return ResponseEntity.ok(metas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MetaResponse> buscarMetaPorId(
            @PathVariable Long id,
            @RequestParam Long usuarioId
    ) {
        MetaResponse meta = metaService.buscarMetaPorId(usuarioId, id);
        return ResponseEntity.ok(meta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetaResponse> atualizarMeta(
            @PathVariable Long id,
            @RequestParam Long usuarioId,
            @Valid @RequestBody MetaRequest request
    ) {
        MetaResponse response = metaService.atualizarMeta(usuarioId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarMeta(
            @PathVariable Long id,
            @RequestParam Long usuarioId
    ) {
        metaService.deletarMeta(usuarioId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MetaResponse> alterarStatusMeta(
            @PathVariable Long id,
            @RequestParam Boolean ativa,
            @RequestParam Long usuarioId
    ) {
        MetaResponse response = metaService.alterarStatusMeta(usuarioId, id, ativa);
        return ResponseEntity.ok(response);
    }
}