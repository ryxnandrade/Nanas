package com.nanas.nanas.controller;

import com.nanas.nanas.dto.CarteiraRequest;
import com.nanas.nanas.dto.CarteiraResponse;
import com.nanas.nanas.dto.TransferenciaRequest;
import com.nanas.nanas.service.CarteiraService;
import com.nanas.nanas.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * Controller para gerenciamento de carteiras do usuário.
 */
@RestController
@RequestMapping("/api/carteiras")
public class CarteiraController {

    private final CarteiraService carteiraService;
    private final AuthService authService;

    public CarteiraController(CarteiraService carteiraService, AuthService authService) {
        this.carteiraService = carteiraService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<CarteiraResponse> criarCarteira(
            @RequestHeader("user_id") String userId,
            @Valid @RequestBody CarteiraRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        CarteiraResponse response = carteiraService.criarCarteira(usuario.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CarteiraResponse>> buscarCarteirasPorUsuario(
            @RequestHeader("user_id") String userId) {
        // user_id agora é OBRIGATÓRIO - não permite mais buscar todas as carteiras
        var usuario = authService.findByFirebaseUid(userId);
        List<CarteiraResponse> response = carteiraService.buscarCarteirasPorUsuario(usuario.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarteiraResponse> buscarCarteiraPorId(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id) {
        var usuario = authService.findByFirebaseUid(userId);
        CarteiraResponse response = carteiraService.buscarCarteiraPorId(usuario.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarteiraResponse> atualizarCarteira(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id,
            @Valid @RequestBody CarteiraRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        CarteiraResponse response = carteiraService.atualizarCarteira(usuario.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCarteira(
            @RequestHeader("user_id") String userId,
            @PathVariable Long id) {
        var usuario = authService.findByFirebaseUid(userId);
        carteiraService.deletarCarteira(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transferir")
    public ResponseEntity<Void> transferirEntreCarteiras(
            @RequestHeader("user_id") String userId,
            @Valid @RequestBody TransferenciaRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        carteiraService.transferirEntreCarteiras(
                usuario.getId(),
                request.getCarteiraOrigemId(),
                request.getCarteiraDestinoId(),
                request.getValor(),
                request.getDescricao());
        return ResponseEntity.ok().build();
    }
}
