package com.nanas.nanas.controller;

import com.nanas.nanas.dto.CategoriaRequest;
import com.nanas.nanas.dto.CategoriaResponse;
import com.nanas.nanas.service.CategoriaService;
import com.nanas.nanas.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * Controller para gerenciamento de categorias do usuário.
 */
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final AuthService authService;

    public CategoriaController(CategoriaService categoriaService, AuthService authService) {
        this.categoriaService = categoriaService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criarCategoria(
            @RequestHeader("user_id") String userId,
            @Valid @RequestBody CategoriaRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        CategoriaResponse response = categoriaService.criarCategoria(usuario.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> buscarCategoriasPorUsuario(
            @RequestHeader("user_id") String userId) {
        // user_id agora é OBRIGATÓRIO
        var usuario = authService.findByFirebaseUid(userId);
        List<CategoriaResponse> response = categoriaService.buscarCategoriasPorUsuario(usuario.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponse> buscarCategoriaPorId(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id) {
        var usuario = authService.findByFirebaseUid(userId);
        CategoriaResponse response = categoriaService.buscarCategoriaPorId(usuario.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> atualizarCategoria(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        CategoriaResponse response = categoriaService.atualizarCategoria(usuario.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCategoria(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id) {
        var usuario = authService.findByFirebaseUid(userId);
        categoriaService.deletarCategoria(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
