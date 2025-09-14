package com.nanas.nanas.service;

import com.nanas.nanas.model.Transacao;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.TransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;

    public Transacao salvarTransacao(Transacao transacao) {
        return transacaoRepository.save(transacao);
    }

    public List<Transacao> buscarTransacoesPorUsuario(Usuario usuario) {
        return transacaoRepository.findByUsuarioOrderByDataDesc(usuario);
    }

    public BigDecimal calcularSaldoAtual(Usuario usuario) {
        List<Transacao> transacoes = transacaoRepository.findByUsuarioOrderByDataDesc(usuario);
        BigDecimal saldo = BigDecimal.ZERO;
        for (Transacao transacao : transacoes) {
            if (transacao.getTipo().equals("RECEITA")) {
                saldo = saldo.add(transacao.getValor());
            } else if (transacao.getTipo().equals("DESPESA")) {
                saldo = saldo.subtract(transacao.getValor());
            }
        }
        return saldo;
    }
}

