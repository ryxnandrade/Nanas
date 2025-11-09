package com.nanas.nanas.service;

import com.nanas.nanas.dto.TransacaoCartaoCreditoDTO;
import com.nanas.nanas.exception.ResourceNotFoundException;
import com.nanas.nanas.mapper.TransacaoCartaoCreditoMapper;
import com.nanas.nanas.model.CartaoCredito;
import com.nanas.nanas.model.Categoria;
import com.nanas.nanas.model.TransacaoCartaoCredito;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.CartaoCreditoRepository;
import com.nanas.nanas.repository.CategoriaRepository;
import com.nanas.nanas.repository.TransacaoCartaoCreditoRepository;
import com.nanas.nanas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransacaoCartaoCreditoService {

    private final TransacaoCartaoCreditoRepository transacaoRepository;
    private final CartaoCreditoRepository cartaoCreditoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final TransacaoCartaoCreditoMapper transacaoMapper;

    @Autowired
    public TransacaoCartaoCreditoService(TransacaoCartaoCreditoRepository transacaoRepository,
                                         CartaoCreditoRepository cartaoCreditoRepository,
                                         UsuarioRepository usuarioRepository,
                                         CategoriaRepository categoriaRepository,
                                         TransacaoCartaoCreditoMapper transacaoMapper) {
        this.transacaoRepository = transacaoRepository;
        this.cartaoCreditoRepository = cartaoCreditoRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.transacaoMapper = transacaoMapper;
    }

    @Transactional
    public TransacaoCartaoCreditoDTO create(TransacaoCartaoCreditoDTO dto) {
        Usuario usuario = findUsuarioById(dto.getUsuarioId());
        CartaoCredito cartaoCredito = findCartaoCreditoById(dto.getCartaoCreditoId());

        Categoria categoria = null;
        if (dto.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria com ID " + dto.getCategoriaId() + " não encontrada."));
        }

        TransacaoCartaoCredito transacao = transacaoMapper.toEntity(dto);
        transacao.setUsuario(usuario);
        transacao.setCartaoCredito(cartaoCredito);
        transacao.setCategoria(categoria);

        TransacaoCartaoCredito transacaoSalva = transacaoRepository.save(transacao);
        return transacaoMapper.toDTO(transacaoSalva);
    }

    @Transactional(readOnly = true)
    public List<TransacaoCartaoCreditoDTO> getByCartaoAndUsuario(Long cartaoId, Long usuarioId) {
        findUsuarioById(usuarioId);
        findCartaoCreditoById(cartaoId);

        return transacaoRepository.findByCartaoCreditoIdAndUsuarioId(cartaoId, usuarioId).stream()
                .map(transacaoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransacaoCartaoCreditoDTO> getFaturaAtual(Long cartaoId, Long usuarioId) {
        CartaoCredito cartao = findCartaoCreditoByIdAndUsuarioId(cartaoId, usuarioId);
        LocalDate hoje = LocalDate.now();
        LocalDate dataFechamentoAtual = hoje.withDayOfMonth(cartao.getDiaFechamento());

        LocalDate dataInicio;
        LocalDate dataFim;

        if (hoje.isAfter(dataFechamentoAtual)) {
            dataInicio = dataFechamentoAtual;
            dataFim = dataFechamentoAtual.plusMonths(1).minusDays(1);
        } else {
            dataInicio = dataFechamentoAtual.minusMonths(1);
            dataFim = dataFechamentoAtual.minusDays(1);
        }

        return findTransacoesByPeriodo(cartaoId, usuarioId, dataInicio, dataFim);
    }

    @Transactional(readOnly = true)
    public List<TransacaoCartaoCreditoDTO> getProximaFatura(Long cartaoId, Long usuarioId) {
        CartaoCredito cartao = findCartaoCreditoByIdAndUsuarioId(cartaoId, usuarioId);
        LocalDate hoje = LocalDate.now();
        LocalDate dataFechamentoAtual = hoje.withDayOfMonth(cartao.getDiaFechamento());

        LocalDate dataInicio;
        LocalDate dataFim;

        if (hoje.isAfter(dataFechamentoAtual)) {
            dataInicio = dataFechamentoAtual.plusMonths(1);
            dataFim = dataFechamentoAtual.plusMonths(2).minusDays(1);
        } else {
            dataInicio = dataFechamentoAtual;
            dataFim = dataFechamentoAtual.plusMonths(1).minusDays(1);
        }

        return findTransacoesByPeriodo(cartaoId, usuarioId, dataInicio, dataFim);
    }

    private List<TransacaoCartaoCreditoDTO> findTransacoesByPeriodo(Long cartaoId, Long usuarioId, LocalDate inicio, LocalDate fim) {
        return transacaoRepository.findAllByCartaoCreditoIdAndUsuarioIdAndDataCompraBetween(cartaoId, usuarioId, inicio, fim)
                .stream()
                .map(transacaoMapper::toDTO)
                .collect(Collectors.toList());
    }

    private Usuario findUsuarioById(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com ID " + usuarioId + " não encontrado."));
    }

    private CartaoCredito findCartaoCreditoById(Long cartaoId) {
        return cartaoCreditoRepository.findById(cartaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão de Crédito com ID " + cartaoId + " não encontrado."));
    }
    
    private CartaoCredito findCartaoCreditoByIdAndUsuarioId(Long cartaoId, Long usuarioId) {
        return cartaoCreditoRepository.findByIdAndUsuarioId(cartaoId, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão de Crédito com ID " + cartaoId + " e Usuário ID " + usuarioId + " não encontrado."));
    }
}
