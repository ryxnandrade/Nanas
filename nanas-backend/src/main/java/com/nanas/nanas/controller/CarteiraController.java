package com.nanas.nanas.controller;

import com.nanas.nanas.dto.CarteiraRequest;
import com.nanas.nanas.dto.CarteiraResponse;
import com.nanas.nanas.dto.TransferenciaRequest;
import com.nanas.nanas.service.CarteiraService;
import com.nanas.nanas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carteiras")
@CrossOrigin(origins = "*")
public class CarteiraController {

    @Autowired
    private CarteiraService carteiraService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<CarteiraResponse> criarCarteira(@RequestHeader("user_id") String userId, @RequestBody CarteiraRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        CarteiraResponse response = carteiraService.criarCarteira(usuario.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CarteiraResponse>> buscarCarteirasPorUsuario(@RequestHeader(value = "user_id", required = false) String userId) {
        if (userId != null && !userId.isEmpty()) {
            var usuario = authService.findByFirebaseUid(userId);
            List<CarteiraResponse> response = carteiraService.buscarCarteirasPorUsuario(usuario.getId());
            return ResponseEntity.ok(response);
        } else {
            List<CarteiraResponse> response = carteiraService.buscarTodasCarteiras();
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarteiraResponse> buscarCarteiraPorId(@RequestHeader("user_id") String userId, @PathVariable Long id) {
        var usuario = authService.findByFirebaseUid(userId);
        CarteiraResponse response = carteiraService.buscarCarteiraPorId(usuario.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarteiraResponse> atualizarCarteira(@RequestHeader("user_id") String userId, @PathVariable Long id, @RequestBody CarteiraRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        CarteiraResponse response = carteiraService.atualizarCarteira(usuario.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCarteira(@RequestHeader("user_id") String userId, @PathVariable Long id) {
        var usuario = authService.findByFirebaseUid(userId);
        carteiraService.deletarCarteira(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transferir")
    public ResponseEntity<Void> transferirEntreCarteiras(@RequestHeader("user_id") String userId, @RequestBody TransferenciaRequest request) {
        var usuario = authService.findByFirebaseUid(userId);
        carteiraService.transferirEntreCarteiras(usuario.getId(), request.getCarteiraOrigemId(), request.getCarteiraDestinoId(), request.getValor(), request.getDescricao());
        return ResponseEntity.ok().build();
    }
}
