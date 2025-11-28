package com.nanas.nanas.service;

import com.nanas.nanas.dto.TransacaoRecorrenteRequest;
import com.nanas.nanas.dto.TransacaoRecorrenteResponse;
import com.nanas.nanas.exception.ResourceNotFoundException;
import com.nanas.nanas.model.*;
import com.nanas.nanas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransacaoRecorrenteService {

    private final TransacaoRecorrenteRepository transacaoRecorrenteRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarteiraRepository carteiraRepository;
    private final CategoriaRepository categoriaRepository;
    private final TransacaoRepository transacaoRepository;
    private final MetaService metaService;

    // CRIAR
    @Transactional
    public TransacaoRecorrenteResponse criarTransacaoRecorrente(Long usuarioId, TransacaoRecorrenteRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Carteira carteira = carteiraRepository.findById(request.getCarteiraId())
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));

        if (!carteira.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Carteira não pertence ao usuário");
        }

        Categoria categoria = null;
        if (request.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
            if (!categoria.getUsuario().getId().equals(usuario.getId())) {
                throw new IllegalArgumentException("Categoria não pertence ao usuário");
            }
        }

        TransacaoRecorrente tr = new TransacaoRecorrente();
        tr.setDescricao(request.getDescricao());
        tr.setValor(request.getValor());
        tr.setTipo(request.getTipo());
        tr.setFrequencia(request.getFrequencia());
        tr.setDiaVencimento(request.getDiaVencimento());
        tr.setDataInicio(request.getDataInicio());
        tr.setDataFim(request.getDataFim());

        // se dataInicio nulo, usa hoje como base
        LocalDate base = request.getDataInicio() != null ? request.getDataInicio() : LocalDate.now();
        tr.setProximaExecucao(calcularProximaExecucao(base, request.getFrequencia(), request.getDiaVencimento()));

        tr.setAtiva(true);
        tr.setUsuario(usuario);
        tr.setCarteira(carteira);
        tr.setCategoria(categoria);

        tr = transacaoRecorrenteRepository.save(tr);

        return converterParaResponse(tr);
    }

    // LISTAR TODAS
    @Transactional(readOnly = true)
    public List<TransacaoRecorrenteResponse> listarTransacoesRecorrentes(Long usuarioId) {
        usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        List<TransacaoRecorrente> transacoes = transacaoRecorrenteRepository.findByUsuarioId(usuarioId);

        return transacoes.stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    // LISTAR ATIVAS
    @Transactional(readOnly = true)
    public List<TransacaoRecorrenteResponse> listarTransacoesRecorrentesAtivas(Long usuarioId) {
        usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        List<TransacaoRecorrente> transacoes = transacaoRecorrenteRepository.findByUsuarioIdAndAtivaTrue(usuarioId);

        return transacoes.stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    // BUSCAR POR ID
    @Transactional(readOnly = true)
    public TransacaoRecorrenteResponse buscarTransacaoRecorrentePorId(Long usuarioId, Long id) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        TransacaoRecorrente transacao = transacaoRecorrenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação recorrente não encontrada"));

        if (!transacao.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Transação recorrente não pertence ao usuário");
        }

        return converterParaResponse(transacao);
    }

    // ATUALIZAR
    @Transactional
    public TransacaoRecorrenteResponse atualizarTransacaoRecorrente(Long usuarioId, Long id, TransacaoRecorrenteRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        TransacaoRecorrente transacao = transacaoRecorrenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação recorrente não encontrada"));

        if (!transacao.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Transação recorrente não pertence ao usuário");
        }

        Carteira carteira = carteiraRepository.findById(request.getCarteiraId())
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));

        if (!carteira.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Carteira não pertence ao usuário");
        }

        Categoria categoria = null;
        if (request.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

            if (!categoria.getUsuario().getId().equals(usuario.getId())) {
                throw new IllegalArgumentException("Categoria não pertence ao usuário");
            }
        }

        transacao.setDescricao(request.getDescricao());
        transacao.setValor(request.getValor());
        transacao.setTipo(request.getTipo());
        transacao.setFrequencia(request.getFrequencia());
        transacao.setDiaVencimento(request.getDiaVencimento());
        transacao.setDataInicio(request.getDataInicio());
        transacao.setDataFim(request.getDataFim());
        transacao.setCarteira(carteira);
        transacao.setCategoria(categoria);

        LocalDate base = request.getDataInicio() != null ? request.getDataInicio() : transacao.getProximaExecucao();
        transacao.setProximaExecucao(calcularProximaExecucao(base, request.getFrequencia(), request.getDiaVencimento()));

        transacao = transacaoRecorrenteRepository.save(transacao);

        return converterParaResponse(transacao);
    }

    // DELETAR
    @Transactional
    public void deletarTransacaoRecorrente(Long usuarioId, Long id) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        TransacaoRecorrente transacao = transacaoRecorrenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação recorrente não encontrada"));

        if (!transacao.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Transação recorrente não pertence ao usuário");
        }

        transacaoRecorrenteRepository.delete(transacao);
    }

    // ALTERAR STATUS
    @Transactional
    public TransacaoRecorrenteResponse alterarStatusTransacaoRecorrente(Long usuarioId, Long id, Boolean ativa) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        TransacaoRecorrente transacao = transacaoRecorrenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação recorrente não encontrada"));

        if (!transacao.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Transação recorrente não pertence ao usuário");
        }

        transacao.setAtiva(ativa);
        transacao = transacaoRecorrenteRepository.save(transacao);

        return converterParaResponse(transacao);
    }

    // EXECUTAR (chamada por id, não precisa usuarioId)
    @Transactional
    public void executarTransacaoRecorrente(Long transacaoRecorrenteId) {
        TransacaoRecorrente recorrente = transacaoRecorrenteRepository.findById(transacaoRecorrenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação recorrente não encontrada"));

        if (!recorrente.getAtiva()) return;

        LocalDate hoje = LocalDate.now();

        if (recorrente.getDataFim() != null && hoje.isAfter(recorrente.getDataFim())) {
            recorrente.setAtiva(false);
            transacaoRecorrenteRepository.save(recorrente);
            return;
        }

        Transacao transacao = new Transacao();
        transacao.setDescricao(recorrente.getDescricao() + " (Recorrente)");
        transacao.setValor(recorrente.getValor());
        transacao.setTipo(recorrente.getTipo());
        transacao.setData(hoje);
        transacao.setUsuario(recorrente.getUsuario());
        transacao.setCarteiraOrigem(recorrente.getCarteira());
        transacao.setCategoria(recorrente.getCategoria());

        transacaoRepository.save(transacao);

        Carteira carteira = recorrente.getCarteira();
        if ("RECEITA".equals(recorrente.getTipo())) {
            carteira.setSaldo(carteira.getSaldo().add(recorrente.getValor()));
        } else if ("DESPESA".equals(recorrente.getTipo())) {
            carteira.setSaldo(carteira.getSaldo().subtract(recorrente.getValor()));
        }
        carteiraRepository.save(carteira);

        if (recorrente.getCategoria() != null) {
            metaService.atualizarMetasAposTransacao(
                    recorrente.getUsuario().getId(),
                    recorrente.getCategoria().getId(),
                    hoje
            );
        }

        LocalDate proximaExecucao = calcularProximaExecucao(
                recorrente.getProximaExecucao() != null ? recorrente.getProximaExecucao() : hoje,
                recorrente.getFrequencia(),
                recorrente.getDiaVencimento()
        );
        recorrente.setProximaExecucao(proximaExecucao);
        transacaoRecorrenteRepository.save(recorrente);
    }

    @Transactional
    public void processarTransacoesRecorrentesPendentes() {
        LocalDate hoje = LocalDate.now();
        List<TransacaoRecorrente> pendentes = transacaoRecorrenteRepository.findTransacoesPendentesExecucao(hoje);

        for (TransacaoRecorrente recorrente : pendentes) {
            try {
                executarTransacaoRecorrente(recorrente.getId());
            } catch (Exception e) {
                System.err.println("Erro ao executar transação recorrente " + recorrente.getId() + ": " + e.getMessage());
            }
        }
    }

    // util
    private LocalDate calcularProximaExecucao(LocalDate dataBase, String frequencia, Integer diaVencimento) {
        if (dataBase == null) dataBase = LocalDate.now();
        LocalDate proxima = dataBase;

        if (frequencia == null) frequencia = "MENSAL";

        switch (frequencia) {
            case "DIARIA":
                proxima = dataBase.plusDays(1);
                break;
            case "SEMANAL":
                proxima = dataBase.plusWeeks(1);
                break;
            case "MENSAL":
                proxima = dataBase.plusMonths(1);
                if (diaVencimento != null && diaVencimento > 0 && diaVencimento <= 31) {
                    try {
                        proxima = proxima.withDayOfMonth(diaVencimento);
                    } catch (Exception e) {
                        proxima = proxima.withDayOfMonth(proxima.lengthOfMonth());
                    }
                }
                break;
            case "ANUAL":
                proxima = dataBase.plusYears(1);
                break;
            default:
                proxima = dataBase.plusMonths(1);
        }
        return proxima;
    }

    private TransacaoRecorrenteResponse converterParaResponse(TransacaoRecorrente transacao) {
        TransacaoRecorrenteResponse response = new TransacaoRecorrenteResponse();
        response.setId(transacao.getId());
        response.setDescricao(transacao.getDescricao());
        response.setValor(transacao.getValor());
        response.setTipo(transacao.getTipo());
        response.setFrequencia(transacao.getFrequencia());
        response.setDiaVencimento(transacao.getDiaVencimento());
        response.setDataInicio(transacao.getDataInicio());
        response.setDataFim(transacao.getDataFim());
        response.setProximaExecucao(transacao.getProximaExecucao());
        response.setAtiva(transacao.getAtiva());
        response.setCarteiraId(transacao.getCarteira().getId());
        response.setCarteiraNome(transacao.getCarteira().getNome());

        if (transacao.getCategoria() != null) {
            response.setCategoriaId(transacao.getCategoria().getId());
            response.setCategoriaNome(transacao.getCategoria().getNome());
        }

        return response;
    }
}
