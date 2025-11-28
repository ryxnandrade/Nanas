package com.nanas.nanas.service;

import com.nanas.nanas.dto.MetaRequest;
import com.nanas.nanas.dto.MetaResponse;
import com.nanas.nanas.exception.ResourceNotFoundException;
import com.nanas.nanas.model.Categoria;
import com.nanas.nanas.model.Meta;
import com.nanas.nanas.model.Transacao;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.model.enums.PeriodoMeta;
import com.nanas.nanas.repository.CategoriaRepository;
import com.nanas.nanas.repository.MetaRepository;
import com.nanas.nanas.repository.TransacaoRepository;
import com.nanas.nanas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MetaService {

    private final MetaRepository metaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final TransacaoRepository transacaoRepository;

    // ---------------------------
    // CRIAR META
    // ---------------------------
    @Transactional
    public MetaResponse criarMeta(Long usuarioId, MetaRequest request) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Categoria categoria = null;

        if (request.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

            if (!categoria.getUsuario().getId().equals(usuario.getId())) {
                throw new IllegalArgumentException("Categoria não pertence ao usuário");
            }
        }

        Meta meta = new Meta();
        meta.setNome(request.getNome());
        meta.setValorMeta(request.getValorMeta());
        meta.setValorAtual(BigDecimal.ZERO);
        meta.setDataInicio(request.getDataInicio());
        meta.setDataFim(request.getDataFim());
                try {
            PeriodoMeta periodoEnum = PeriodoMeta.valueOf(request.getPeriodo().toUpperCase());
            meta.setPeriodo(periodoEnum);
        } catch (IllegalArgumentException e) {
            // Tratar erro se a String não for um valor válido do Enum
            throw new IllegalArgumentException("Período inválido: " + request.getPeriodo());
        }
        meta.setAtiva(true);
        meta.setUsuario(usuario);
        meta.setCategoria(categoria);

        meta = metaRepository.save(meta);

        atualizarValorAtualMeta(meta);

        return converterParaResponse(meta);
    }

    // ---------------------------
    // LISTAR TODAS AS METAS
    // ---------------------------
    @Transactional(readOnly = true)
    public List<MetaResponse> listarMetas(Long usuarioId) {

        usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        List<Meta> metas = metaRepository.findByUsuarioId(usuarioId);

        return metas.stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------
    // LISTAR METAS ATIVAS
    // ---------------------------
    @Transactional(readOnly = true)
    public List<MetaResponse> listarMetasAtivas(Long usuarioId) {

        usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        List<Meta> metas = metaRepository.findByUsuarioIdAndAtivaTrue(usuarioId);

        return metas.stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------
    // BUSCAR META POR ID
    // ---------------------------
    @Transactional(readOnly = true)
    public MetaResponse buscarMetaPorId(Long usuarioId, Long metaId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Meta meta = metaRepository.findById(metaId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        if (!meta.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Meta não pertence ao usuário");
        }

        return converterParaResponse(meta);
    }

    // ---------------------------
    // ATUALIZAR META
    // ---------------------------
    @Transactional
    public MetaResponse atualizarMeta(Long usuarioId, Long metaId, MetaRequest request) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Meta meta = metaRepository.findById(metaId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        if (!meta.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Meta não pertence ao usuário");
        }

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        if (!categoria.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Categoria não pertence ao usuário");
        }

        meta.setNome(request.getNome());
        meta.setValorMeta(request.getValorMeta());
        meta.setDataInicio(request.getDataInicio());
        meta.setDataFim(request.getDataFim());
                try {
            // Assumindo que o DTO de requisição (MetaRequest) ainda tem o periodo como String
            PeriodoMeta periodoEnum = PeriodoMeta.valueOf(request.getPeriodo().toUpperCase());
            meta.setPeriodo(periodoEnum);
        } catch (IllegalArgumentException e) {
            // Tratar erro se a String não for um valor válido do Enum
            throw new IllegalArgumentException("Período inválido: " + request.getPeriodo());
        }
        meta.setCategoria(categoria);

        meta = metaRepository.save(meta);

        atualizarValorAtualMeta(meta);

        return converterParaResponse(meta);
    }

    // ---------------------------
    // DELETAR META
    // ---------------------------
    @Transactional
    public void deletarMeta(Long usuarioId, Long metaId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Meta meta = metaRepository.findById(metaId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        if (!meta.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Meta não pertence ao usuário");
        }

        metaRepository.delete(meta);
    }

    // ---------------------------
    // ALTERAR STATUS DA META
    // ---------------------------
    @Transactional
    public MetaResponse alterarStatusMeta(Long usuarioId, Long metaId, Boolean ativa) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Meta meta = metaRepository.findById(metaId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        if (!meta.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Meta não pertence ao usuário");
        }

        meta.setAtiva(ativa);
        meta = metaRepository.save(meta);

        return converterParaResponse(meta);
    }

    // ---------------------------
    // RECALCULAR VALOR ATUAL
    // ---------------------------
    @Transactional
    public void atualizarValorAtualMeta(Meta meta) {

        List<Transacao> transacoes = transacaoRepository
                .findByUsuarioIdAndCategoria_IdAndDataBetween(
                        meta.getUsuario().getId(),
                        meta.getCategoria().getId(),
                        meta.getDataInicio(),
                        meta.getDataFim()
                );

        BigDecimal valorAtual = transacoes.stream()
                .filter(t -> "DESPESA".equals(t.getTipo()))
                .map(Transacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        meta.setValorAtual(valorAtual);
        metaRepository.save(meta);
    }

    // ---------------------------
    // ATUALIZAR METAS APÓS TRANSAÇÃO
    // ---------------------------
    @Transactional
    public void atualizarMetasAposTransacao(Long usuarioId, Long categoriaId, LocalDate data) {

        List<Meta> metas = metaRepository.findByUsuarioIdAndCategoriaId(usuarioId, categoriaId);

        for (Meta meta : metas) {
            if (meta.getAtiva()
                    && !data.isBefore(meta.getDataInicio())
                    && !data.isAfter(meta.getDataFim())) {
                atualizarValorAtualMeta(meta);
            }
        }
    }

    // ---------------------------
    // CONVERTER PARA RESPONSE
    // ---------------------------
    private MetaResponse converterParaResponse(Meta meta) {

        MetaResponse response = new MetaResponse();
        response.setId(meta.getId());
        response.setNome(meta.getNome());
        response.setValorMeta(meta.getValorMeta());
        response.setValorAtual(meta.getValorAtual());
        response.setDataInicio(meta.getDataInicio());
        response.setDataFim(meta.getDataFim());
        response.setPeriodo(meta.getPeriodo().name());
        response.setAtiva(meta.getAtiva());
        response.setPercentualAtingido(meta.getPercentualAtingido());

        if (meta.getCategoria() != null) {
            response.setCategoriaId(meta.getCategoria().getId());
            response.setCategoriaNome(meta.getCategoria().getNome());
        } else {
            response.setCategoriaId(null);
            response.setCategoriaNome(null);
        }

        return response;
    }
}
