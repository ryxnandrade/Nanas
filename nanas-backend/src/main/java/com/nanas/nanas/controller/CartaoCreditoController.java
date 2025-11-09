package com.nanas.nanas.controller;

import com.nanas.nanas.dto.CartaoCreditoDTO;
import com.nanas.nanas.service.CartaoCreditoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cartoes-credito")
public class CartaoCreditoController {

    @Autowired
    private CartaoCreditoService cartaoCreditoService;

    @PostMapping
    public ResponseEntity<CartaoCreditoDTO> create(@RequestBody CartaoCreditoDTO cartaoCreditoDTO) {
        return ResponseEntity.ok(cartaoCreditoService.create(cartaoCreditoDTO));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CartaoCreditoDTO>> getByUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(cartaoCreditoService.getByUsuario(usuarioId));
    }
}
