package com.nanas.nanas.controller;

import com.nanas.nanas.dto.TransacaoRequest;
import com.nanas.nanas.dto.TransacaoResponse;
import com.nanas.nanas.model.Transacao;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.service.TransacaoService;
import com.nanas.nanas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "*")
public class TransacaoController {

    @Autowired
    private TransacaoService transacaoService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<?> criarTransacao(@RequestBody TransacaoRequest request, @RequestParam String user_id) {
        try {
            Optional<Usuario> usuarioOptional = authService.findByFirebaseUid(user_id);
            if (usuarioOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
            }

            Transacao transacao = new Transacao();
            transacao.setDescricao(request.getDescription());
            transacao.setValor(request.getAmount());
            transacao.setTipo(request.getType().toUpperCase());
            transacao.setData(LocalDate.parse(request.getDate()));
            transacao.setUsuario(usuarioOptional.get());

            Transacao novaTransacao = transacaoService.salvarTransacao(transacao);
            
            TransacaoResponse response = new TransacaoResponse();
            response.setId(novaTransacao.getId());
            response.setDescription(novaTransacao.getDescricao());
            response.setAmount(novaTransacao.getValor());
            response.setType(novaTransacao.getTipo().toLowerCase());
            response.setDate(novaTransacao.getData().toString());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao criar transação");
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTransacoes(@RequestParam String user_id) {
        try {
            Optional<Usuario> usuarioOptional = authService.findByFirebaseUid(user_id);
            if (usuarioOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
            }

            List<Transacao> transacoes = transacaoService.buscarTransacoesPorUsuario(usuarioOptional.get());
            
            List<TransacaoResponse> response = transacoes.stream().map(t -> {
                TransacaoResponse tr = new TransacaoResponse();
                tr.setId(t.getId());
                tr.setDescription(t.getDescricao());
                tr.setAmount(t.getValor());
                tr.setType(t.getTipo().toLowerCase());
                tr.setDate(t.getData().toString());
                return tr;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao listar transações");
        }
    }

    @GetMapping("/saldo")
    public ResponseEntity<?> getSaldoAtual(@RequestParam String user_id) {
        try {
            Optional<Usuario> usuarioOptional = authService.findByFirebaseUid(user_id);
            if (usuarioOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
            }

            BigDecimal saldo = transacaoService.calcularSaldoAtual(usuarioOptional.get());
            return ResponseEntity.ok(saldo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao calcular saldo");
        }
    }
}

