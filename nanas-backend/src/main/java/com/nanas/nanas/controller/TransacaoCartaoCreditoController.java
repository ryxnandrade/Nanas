package com.nanas.nanas.controller;

import com.nanas.nanas.dto.TransacaoCartaoCreditoDTO;
import com.nanas.nanas.service.TransacaoCartaoCreditoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios/{usuarioId}/cartoes-credito/{cartaoId}/transacoes" )
public class TransacaoCartaoCreditoController {

    private final TransacaoCartaoCreditoService transacaoService;

    public TransacaoCartaoCreditoController(TransacaoCartaoCreditoService transacaoService) {
        this.transacaoService = transacaoService;
    }

@PostMapping
public ResponseEntity<TransacaoCartaoCreditoDTO> create(
        @PathVariable Long usuarioId,
        @PathVariable Long cartaoId,
        @Valid @RequestBody TransacaoCartaoCreditoDTO dto) {

    dto.setUsuarioId(usuarioId);
    dto.setCartaoCreditoId(cartaoId);
    
    TransacaoCartaoCreditoDTO novaTransacao = transacaoService.create(dto);

    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(novaTransacao.getId())
            .toUri();

    return ResponseEntity.created(location).body(novaTransacao);
}


    @GetMapping
    public ResponseEntity<List<TransacaoCartaoCreditoDTO>> getByCartaoAndUsuario(
            @PathVariable Long usuarioId,
            @PathVariable Long cartaoId) {
        List<TransacaoCartaoCreditoDTO> transacoes = transacaoService.getByCartaoAndUsuario(cartaoId, usuarioId);
        return ResponseEntity.ok(transacoes);
    }
}
