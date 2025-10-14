package com.nanas.nanas.service;

import com.nanas.nanas.dto.TransacaoRequest;
import com.nanas.nanas.dto.TransacaoResponse;
import com.nanas.nanas.model.Carteira;
import com.nanas.nanas.model.Categoria;
import com.nanas.nanas.model.Transacao;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.CarteiraRepository;
import com.nanas.nanas.repository.CategoriaRepository;
import com.nanas.nanas.repository.TransacaoRepository;
import com.nanas.nanas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CarteiraRepository carteiraRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private CarteiraService carteiraService;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE;

    @Transactional
    public TransacaoResponse criarTransacao(Long usuarioId, TransacaoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Carteira carteiraOrigem = carteiraRepository.findById(request.getCarteiraOrigemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carteira de origem não encontrada"));

        if (!carteiraOrigem.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado à carteira de origem");
        }

        Categoria categoria = null;
        if (request.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));
            if (!categoria.getUsuario().getId().equals(usuarioId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado à categoria");
            }
        }

        Transacao transacao = new Transacao();
        transacao.setDescricao(request.getDescricao());
        transacao.setValor(request.getValor());
        transacao.setTipo(request.getTipo());
        transacao.setData(LocalDate.parse(request.getData(), dateFormatter));
        transacao.setUsuario(usuario);
        transacao.setCarteiraOrigem(carteiraOrigem);
        transacao.setCategoria(categoria);

        if ("RECEITA".equals(request.getTipo())) {
            carteiraService.atualizarSaldoCarteira(carteiraOrigem.getId(), request.getValor(), true);
        } else if ("DESPESA".equals(request.getTipo())) {
            if (carteiraOrigem.getSaldo().compareTo(request.getValor()) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saldo insuficiente na carteira de origem");
            }
            carteiraService.atualizarSaldoCarteira(carteiraOrigem.getId(), request.getValor(), false);
        } else if ("TRANSFERENCIA".equals(request.getTipo())) {
            Carteira carteiraDestino = carteiraRepository.findById(request.getCarteiraDestinoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carteira de destino não encontrada"));
            if (!carteiraDestino.getUsuario().getId().equals(usuarioId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado à carteira de destino");
            }
            if (carteiraOrigem.getSaldo().compareTo(request.getValor()) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saldo insuficiente na carteira de origem para transferência");
            }
            carteiraService.transferirEntreCarteiras(usuarioId, carteiraOrigem.getId(), carteiraDestino.getId(), request.getValor(), request.getDescricao());
            transacao.setCarteiraDestino(carteiraDestino);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de transação inválido");
        }

        transacao = transacaoRepository.save(transacao);
        return toTransacaoResponse(transacao);
    }

    public List<TransacaoResponse> buscarTransacoesPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        List<Transacao> transacoes = transacaoRepository.findByUsuarioOrderByDataDesc(usuario);
        return transacoes.stream().map(this::toTransacaoResponse).collect(Collectors.toList());
    }

    public List<TransacaoResponse> buscarTodasTransacoes() {
        List<Transacao> transacoes = transacaoRepository.findAll();
        return transacoes.stream().map(this::toTransacaoResponse).collect(Collectors.toList());
    }

    public TransacaoResponse buscarTransacaoPorId(Long usuarioId, Long transacaoId) {
        Transacao transacao = transacaoRepository.findById(transacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transação não encontrada"));
        if (!transacao.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta transação");
        }
        return toTransacaoResponse(transacao);
    }

    @Transactional
    public TransacaoResponse atualizarTransacao(Long usuarioId, Long transacaoId, TransacaoRequest request) {
        Transacao transacaoExistente = transacaoRepository.findById(transacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transação não encontrada"));

        if (!transacaoExistente.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta transação");
        }

        reverterSaldoTransacao(transacaoExistente);

        transacaoExistente.setDescricao(request.getDescricao());
        transacaoExistente.setValor(request.getValor());
        transacaoExistente.setTipo(request.getTipo());
        transacaoExistente.setData(LocalDate.parse(request.getData(), dateFormatter));

        Carteira novaCarteiraOrigem = carteiraRepository.findById(request.getCarteiraOrigemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nova carteira de origem não encontrada"));
        if (!novaCarteiraOrigem.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado à nova carteira de origem");
        }
        transacaoExistente.setCarteiraOrigem(novaCarteiraOrigem);

        Categoria novaCategoria = null;
        if (request.getCategoriaId() != null) {
            novaCategoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nova categoria não encontrada"));
            if (!novaCategoria.getUsuario().getId().equals(usuarioId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado à nova categoria");
            }
        }
        transacaoExistente.setCategoria(novaCategoria);

        aplicarSaldoTransacao(transacaoExistente);

        transacaoExistente = transacaoRepository.save(transacaoExistente);
        return toTransacaoResponse(transacaoExistente);
    }

    @Transactional
    public void deletarTransacao(Long usuarioId, Long transacaoId) {
        Transacao transacao = transacaoRepository.findById(transacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transação não encontrada"));

        if (!transacao.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta transação");
        }

        reverterSaldoTransacao(transacao);
        transacaoRepository.delete(transacao);
    }

    private void reverterSaldoTransacao(Transacao transacao) {
        if ("RECEITA".equals(transacao.getTipo())) {
            carteiraService.atualizarSaldoCarteira(transacao.getCarteiraOrigem().getId(), transacao.getValor(), false); 
        } else if ("DESPESA".equals(transacao.getTipo())) {
            carteiraService.atualizarSaldoCarteira(transacao.getCarteiraOrigem().getId(), transacao.getValor(), true);
        } else if ("TRANSFERENCIA".equals(transacao.getTipo())) {
            carteiraService.atualizarSaldoCarteira(transacao.getCarteiraOrigem().getId(), transacao.getValor(), true); 
            carteiraService.atualizarSaldoCarteira(transacao.getCarteiraDestino().getId(), transacao.getValor(), false); 
        }
    }

    private void aplicarSaldoTransacao(Transacao transacao) {
        if ("RECEITA".equals(transacao.getTipo())) {
            carteiraService.atualizarSaldoCarteira(transacao.getCarteiraOrigem().getId(), transacao.getValor(), true);
        } else if ("DESPESA".equals(transacao.getTipo())) {
            carteiraService.atualizarSaldoCarteira(transacao.getCarteiraOrigem().getId(), transacao.getValor(), false);
        } else if ("TRANSFERENCIA".equals(transacao.getTipo())) {
            carteiraService.atualizarSaldoCarteira(transacao.getCarteiraOrigem().getId(), transacao.getValor(), false);
            carteiraService.atualizarSaldoCarteira(transacao.getCarteiraDestino().getId(), transacao.getValor(), true);
        }
    }

    private TransacaoResponse toTransacaoResponse(Transacao transacao) {
        TransacaoResponse response = new TransacaoResponse();
        response.setId(transacao.getId());
        response.setDescricao(transacao.getDescricao());
        response.setValor(transacao.getValor());
        response.setTipo(transacao.getTipo());
        response.setData(transacao.getData().format(dateFormatter));
        response.setCarteiraOrigemId(transacao.getCarteiraOrigem().getId());
        response.setCarteiraOrigemNome(transacao.getCarteiraOrigem().getNome());
        if (transacao.getCarteiraDestino() != null) {
            response.setCarteiraDestinoId(transacao.getCarteiraDestino().getId());
            response.setCarteiraDestinoNome(transacao.getCarteiraDestino().getNome());
        }
        if (transacao.getCategoria() != null) {
            response.setCategoriaId(transacao.getCategoria().getId());
            response.setCategoriaNome(transacao.getCategoria().getNome());
        }
        return response;
    }
}

