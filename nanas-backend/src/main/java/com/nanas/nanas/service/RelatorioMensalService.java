package com.nanas.nanas.service;

import com.nanas.nanas.dto.*;
import com.nanas.nanas.exception.ResourceNotFoundException;
import com.nanas.nanas.model.*;
import com.nanas.nanas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioMensalService {
    
    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarteiraRepository carteiraRepository;
    private final MetaRepository metaRepository;
    
    @Transactional(readOnly = true)
    public RelatorioMensalDTO gerarRelatorioMensal(String firebaseUid, Integer ano, Integer mes) {
        Usuario usuario = usuarioRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        YearMonth periodo = YearMonth.of(ano, mes);
        LocalDate inicioMes = periodo.atDay(1);
        LocalDate fimMes = periodo.atEndOfMonth();
        
        // Buscar transações do mês
        List<Transacao> transacoesMes = transacaoRepository.findByUsuarioAndDataBetween(
                usuario, inicioMes, fimMes);
        
        // Calcular totais
        BigDecimal totalReceitas = transacoesMes.stream()
                .filter(t -> "RECEITA".equals(t.getTipo()))
                .map(Transacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalDespesas = transacoesMes.stream()
                .filter(t -> "DESPESA".equals(t.getTipo()))
                .map(Transacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal saldoFinal = totalReceitas.subtract(totalDespesas);
        
        // Calcular variação em relação ao mês anterior
        YearMonth mesAnterior = periodo.minusMonths(1);
        LocalDate inicioMesAnterior = mesAnterior.atDay(1);
        LocalDate fimMesAnterior = mesAnterior.atEndOfMonth();
        
        List<Transacao> transacoesMesAnterior = transacaoRepository.findByUsuarioAndDataBetween(
                usuario, inicioMesAnterior, fimMesAnterior);
        
        BigDecimal totalDespesasMesAnterior = transacoesMesAnterior.stream()
                .filter(t -> "DESPESA".equals(t.getTipo()))
                .map(Transacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal variacaoMesAnterior = totalDespesas.subtract(totalDespesasMesAnterior);
        BigDecimal percentualVariacao = BigDecimal.ZERO;
        
        if (totalDespesasMesAnterior.compareTo(BigDecimal.ZERO) > 0) {
            percentualVariacao = variacaoMesAnterior.divide(totalDespesasMesAnterior, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        
        // Agrupar despesas por categoria
        List<DespesaPorCategoriaDTO> despesasPorCategoria = agruparDespesasPorCategoria(transacoesMes);
        
        // Buscar progresso das metas
        List<MetaProgressoDTO> progressoMetas = calcularProgressoMetas(usuario, inicioMes, fimMes);
        
        // Buscar maiores transações
        List<TransacaoResumoDTO> maioresTransacoes = buscarMaioresTransacoes(transacoesMes);
        
        // Resumo das carteiras
        ResumoCarteirasDTO resumoCarteiras = gerarResumoCarteiras(usuario);
        
        // Determinar status financeiro
        String statusFinanceiro = determinarStatusFinanceiro(saldoFinal, percentualVariacao);
        
        RelatorioMensalDTO relatorio = new RelatorioMensalDTO();
        relatorio.setPeriodo(periodo);
        relatorio.setTotalReceitas(totalReceitas);
        relatorio.setTotalDespesas(totalDespesas);
        relatorio.setSaldoFinal(saldoFinal);
        relatorio.setVariacaoMesAnterior(variacaoMesAnterior);
        relatorio.setPercentualVariacao(percentualVariacao);
        relatorio.setDespesasPorCategoria(despesasPorCategoria);
        relatorio.setProgressoMetas(progressoMetas);
        relatorio.setMaioresTransacoes(maioresTransacoes);
        relatorio.setResumoCarteiras(resumoCarteiras);
        relatorio.setStatusFinanceiro(statusFinanceiro);
        
        return relatorio;
    }
    
    @Transactional(readOnly = true)
    public RelatorioMensalDTO gerarRelatorioMesAtual(String firebaseUid) {
        LocalDate hoje = LocalDate.now();
        return gerarRelatorioMensal(firebaseUid, hoje.getYear(), hoje.getMonthValue());
    }
    
    private List<DespesaPorCategoriaDTO> agruparDespesasPorCategoria(List<Transacao> transacoes) {
        Map<String, BigDecimal> despesasPorCategoria = new HashMap<>();
        
        for (Transacao transacao : transacoes) {
            if ("DESPESA".equals(transacao.getTipo())) {
                String categoria = transacao.getCategoria() != null ? 
                        transacao.getCategoria().getNome() : "Sem categoria";
                despesasPorCategoria.merge(categoria, transacao.getValor(), BigDecimal::add);
            }
        }
        
        BigDecimal totalDespesas = despesasPorCategoria.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return despesasPorCategoria.entrySet().stream()
                .map(entry -> {
                    BigDecimal percentual = BigDecimal.ZERO;
                    if (totalDespesas.compareTo(BigDecimal.ZERO) > 0) {
                        percentual = entry.getValue().divide(totalDespesas, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100));
                    }
                    return new DespesaPorCategoriaDTO(entry.getKey(), entry.getValue(), percentual);
                })
                .sorted((a, b) -> b.getValor().compareTo(a.getValor()))
                .collect(Collectors.toList());
    }
    
    private List<MetaProgressoDTO> calcularProgressoMetas(Usuario usuario, LocalDate inicio, LocalDate fim) {
        List<Meta> metas = metaRepository.findMetasAtivasNoPeriodo(usuario.getId(), inicio);
        
        return metas.stream()
                .map(meta -> {
                    BigDecimal percentual = meta.getPercentualAtingido();
                    String status;
                    
                    if (percentual.compareTo(BigDecimal.valueOf(100)) >= 0) {
                        status = "EXCEDIDA";
                    } else if (percentual.compareTo(BigDecimal.valueOf(80)) >= 0) {
                        status = "EM_PROGRESSO";
                    } else {
                        status = "EM_PROGRESSO";
                    }
                    
                    if (percentual.compareTo(BigDecimal.valueOf(100)) <= 0 && 
                        percentual.compareTo(BigDecimal.valueOf(90)) >= 0) {
                        status = "ATINGIDA";
                    }
                    
                    return new MetaProgressoDTO(
                            meta.getCategoria().getNome(),
                            meta.getValorMeta(),
                            meta.getValorAtual(),
                            percentual,
                            status
                    );
                })
                .collect(Collectors.toList());
    }
    
    private List<TransacaoResumoDTO> buscarMaioresTransacoes(List<Transacao> transacoes) {
        return transacoes.stream()
                .filter(t -> "DESPESA".equals(t.getTipo()))
                .sorted((a, b) -> b.getValor().compareTo(a.getValor()))
                .limit(5)
                .map(t -> new TransacaoResumoDTO(
                        t.getDescricao(),
                        t.getValor(),
                        t.getTipo(),
                        t.getData(),
                        t.getCategoria() != null ? t.getCategoria().getNome() : "Sem categoria"
                ))
                .collect(Collectors.toList());
    }
    
    private ResumoCarteirasDTO gerarResumoCarteiras(Usuario usuario) {
        List<Carteira> carteiras = carteiraRepository.findByUsuario(usuario);
        
        BigDecimal saldoTotal = carteiras.stream()
                .map(Carteira::getSaldo)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<CarteiraResumoDTO> carteirasResumo = carteiras.stream()
                .map(c -> new CarteiraResumoDTO(
                        c.getNome(),
                        c.getTipo().toString(),
                        c.getSaldo()
                ))
                .collect(Collectors.toList());
        
        return new ResumoCarteirasDTO(saldoTotal, carteirasResumo);
    }
    
    private String determinarStatusFinanceiro(BigDecimal saldoFinal, BigDecimal percentualVariacao) {
        if (saldoFinal.compareTo(BigDecimal.ZERO) > 0 && 
            percentualVariacao.compareTo(BigDecimal.ZERO) <= 0) {
            return "POSITIVO";
        } else if (saldoFinal.compareTo(BigDecimal.ZERO) < 0 || 
                   percentualVariacao.compareTo(BigDecimal.valueOf(20)) > 0) {
            return "NEGATIVO";
        } else {
            return "NEUTRO";
        }
    }
}
