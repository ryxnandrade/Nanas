package com.nanas.nanas.service;

import com.nanas.nanas.dto.InsightDTO;
import com.nanas.nanas.exception.ResourceNotFoundException;
import com.nanas.nanas.model.Categoria;
import com.nanas.nanas.model.Transacao;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.CategoriaRepository;
import com.nanas.nanas.repository.TransacaoRepository;
import com.nanas.nanas.repository.UsuarioRepository;
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
public class InsightService {
    
    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    
    @Transactional(readOnly = true)
    public List<InsightDTO> gerarInsights(String firebaseUid) {
        Usuario usuario = usuarioRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        List<InsightDTO> insights = new ArrayList<>();
        
        // Gerar insights de comparação mensal por categoria
        insights.addAll(gerarInsightsComparacaoMensal(usuario));
        
        // Gerar insights de gastos incomuns
        insights.addAll(gerarInsightsGastosIncomuns(usuario));
        
        // Gerar insights de tendências
        insights.addAll(gerarInsightsTendencias(usuario));
        
        // Gerar insights de economia
        insights.addAll(gerarInsightsEconomia(usuario));
        
        return insights;
    }
    
    private List<InsightDTO> gerarInsightsComparacaoMensal(Usuario usuario) {
        List<InsightDTO> insights = new ArrayList<>();
        
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMesAtual = hoje.withDayOfMonth(1);
        LocalDate fimMesAtual = hoje.withDayOfMonth(hoje.lengthOfMonth());
        
        // Calcular média dos últimos 3 meses (excluindo o mês atual)
        LocalDate inicioTresMesesAtras = inicioMesAtual.minusMonths(3);
        LocalDate fimMesAnterior = inicioMesAtual.minusDays(1);
        
        List<Transacao> transacoesMesAtual = transacaoRepository.findByUsuarioAndDataBetween(
                usuario, inicioMesAtual, fimMesAtual);
        
        List<Transacao> transacoesTresMesesAnteriores = transacaoRepository.findByUsuarioAndDataBetween(
                usuario, inicioTresMesesAtras, fimMesAnterior);
        
        // Agrupar por categoria
        Map<Long, BigDecimal> gastosMesAtualPorCategoria = agruparGastosPorCategoria(transacoesMesAtual);
        Map<Long, BigDecimal> gastosTresMesesPorCategoria = agruparGastosPorCategoria(transacoesTresMesesAnteriores);
        
        for (Map.Entry<Long, BigDecimal> entry : gastosMesAtualPorCategoria.entrySet()) {
            Long categoriaId = entry.getKey();
            BigDecimal gastoMesAtual = entry.getValue();
            
            if (gastosTresMesesPorCategoria.containsKey(categoriaId)) {
                BigDecimal gastoTresMeses = gastosTresMesesPorCategoria.get(categoriaId);
                BigDecimal mediaMensal = gastoTresMeses.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
                
                if (mediaMensal.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal variacao = gastoMesAtual.subtract(mediaMensal);
                    BigDecimal percentualVariacao = variacao.divide(mediaMensal, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                    
                    if (percentualVariacao.abs().compareTo(BigDecimal.valueOf(20)) > 0) {
                        Optional<Categoria> categoriaOpt = categoriaRepository.findById(categoriaId);
                        if (categoriaOpt.isPresent()) {
                            String nomeCategoria = categoriaOpt.get().getNome();
                            
                            InsightDTO insight = new InsightDTO();
                            insight.setCategoria(nomeCategoria);
                            insight.setValorAtual(gastoMesAtual);
                            insight.setValorComparacao(mediaMensal);
                            insight.setPercentualVariacao(percentualVariacao);
                            insight.setPeriodo("últimos 3 meses");
                            
                            if (percentualVariacao.compareTo(BigDecimal.ZERO) > 0) {
                                insight.setTipo("ALERTA");
                                insight.setTitulo("Aumento de gastos detectado");
                                insight.setMensagem(String.format(
                                        "Você gastou %.2f%% a mais com '%s' este mês em comparação com a média dos últimos 3 meses",
                                        percentualVariacao, nomeCategoria));
                            } else {
                                insight.setTipo("SUCESSO");
                                insight.setTitulo("Redução de gastos");
                                insight.setMensagem(String.format(
                                        "Você gastou %.2f%% a menos com '%s' este mês em comparação com a média dos últimos 3 meses",
                                        percentualVariacao.abs(), nomeCategoria));
                            }
                            
                            insights.add(insight);
                        }
                    }
                }
            }
        }
        
        return insights;
    }
    
    private List<InsightDTO> gerarInsightsGastosIncomuns(Usuario usuario) {
        List<InsightDTO> insights = new ArrayList<>();
        
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMesAtual = hoje.withDayOfMonth(1);
        LocalDate fimMesAtual = hoje.withDayOfMonth(hoje.lengthOfMonth());
        
        // Calcular desvio padrão dos últimos 6 meses por categoria
        LocalDate inicioSeisMesesAtras = inicioMesAtual.minusMonths(6);
        
        List<Transacao> transacoesSeisMeses = transacaoRepository.findByUsuarioAndDataBetween(
                usuario, inicioSeisMesesAtras, fimMesAtual);
        
        Map<Long, List<BigDecimal>> gastosMensaisPorCategoria = new HashMap<>();
        
        // Agrupar gastos por categoria e por mês
        for (int i = 0; i < 6; i++) {
            LocalDate inicioMes = inicioMesAtual.minusMonths(i);
            LocalDate fimMes = inicioMes.withDayOfMonth(inicioMes.lengthOfMonth());
            
            List<Transacao> transacoesMes = transacoesSeisMeses.stream()
                    .filter(t -> !t.getData().isBefore(inicioMes) && !t.getData().isAfter(fimMes))
                    .collect(Collectors.toList());
            
            Map<Long, BigDecimal> gastosMes = agruparGastosPorCategoria(transacoesMes);
            
            for (Map.Entry<Long, BigDecimal> entry : gastosMes.entrySet()) {
                gastosMensaisPorCategoria.computeIfAbsent(entry.getKey(), k -> new ArrayList<>())
                        .add(entry.getValue());
            }
        }
        
        // Analisar gastos do mês atual
        List<Transacao> transacoesMesAtual = transacaoRepository.findByUsuarioAndDataBetween(
                usuario, inicioMesAtual, fimMesAtual);
        
        Map<Long, BigDecimal> gastosMesAtual = agruparGastosPorCategoria(transacoesMesAtual);
        
        for (Map.Entry<Long, BigDecimal> entry : gastosMesAtual.entrySet()) {
            Long categoriaId = entry.getKey();
            BigDecimal gastoAtual = entry.getValue();
            
            if (gastosMensaisPorCategoria.containsKey(categoriaId)) {
                List<BigDecimal> gastosHistoricos = gastosMensaisPorCategoria.get(categoriaId);
                
                if (gastosHistoricos.size() >= 3) {
                    BigDecimal media = gastosHistoricos.stream()
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(gastosHistoricos.size()), 2, RoundingMode.HALF_UP);
                    
                    BigDecimal desvioPadrao = calcularDesvioPadrao(gastosHistoricos, media);
                    
                    // Se o gasto atual está 2 desvios padrão acima da média, é incomum
                    if (gastoAtual.compareTo(media.add(desvioPadrao.multiply(BigDecimal.valueOf(2)))) > 0) {
                        Optional<Categoria> categoriaOpt = categoriaRepository.findById(categoriaId);
                        if (categoriaOpt.isPresent()) {
                            String nomeCategoria = categoriaOpt.get().getNome();
                            
                            InsightDTO insight = new InsightDTO();
                            insight.setTipo("ALERTA");
                            insight.setCategoria(nomeCategoria);
                            insight.setTitulo("Gasto incomum detectado");
                            insight.setMensagem(String.format(
                                    "Detectamos um gasto incomum na categoria '%s'. Valor atual: R$ %.2f (média histórica: R$ %.2f)",
                                    nomeCategoria, gastoAtual, media));
                            insight.setValorAtual(gastoAtual);
                            insight.setValorComparacao(media);
                            insight.setPeriodo("últimos 6 meses");
                            
                            insights.add(insight);
                        }
                    }
                }
            }
        }
        
        return insights;
    }
    
    private List<InsightDTO> gerarInsightsTendencias(Usuario usuario) {
        List<InsightDTO> insights = new ArrayList<>();
        
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMesAtual = hoje.withDayOfMonth(1);
        
        // Analisar tendência dos últimos 3 meses
        Map<Long, List<BigDecimal>> gastosTresMesesPorCategoria = new HashMap<>();
        
        for (int i = 0; i < 3; i++) {
            LocalDate inicioMes = inicioMesAtual.minusMonths(i);
            LocalDate fimMes = inicioMes.withDayOfMonth(inicioMes.lengthOfMonth());
            
            List<Transacao> transacoesMes = transacaoRepository.findByUsuarioAndDataBetween(
                    usuario, inicioMes, fimMes);
            
            Map<Long, BigDecimal> gastosMes = agruparGastosPorCategoria(transacoesMes);
            
            for (Map.Entry<Long, BigDecimal> entry : gastosMes.entrySet()) {
                gastosTresMesesPorCategoria.computeIfAbsent(entry.getKey(), k -> new ArrayList<>())
                        .add(0, entry.getValue()); // Adiciona no início para manter ordem cronológica
            }
        }
        
        // Verificar tendências crescentes
        for (Map.Entry<Long, List<BigDecimal>> entry : gastosTresMesesPorCategoria.entrySet()) {
            List<BigDecimal> gastos = entry.getValue();
            
            if (gastos.size() == 3) {
                // Verificar se há tendência crescente consistente
                if (gastos.get(1).compareTo(gastos.get(0)) > 0 && 
                    gastos.get(2).compareTo(gastos.get(1)) > 0) {
                    
                    Optional<Categoria> categoriaOpt = categoriaRepository.findById(entry.getKey());
                    if (categoriaOpt.isPresent()) {
                        String nomeCategoria = categoriaOpt.get().getNome();
                        
                        InsightDTO insight = new InsightDTO();
                        insight.setTipo("INFORMACAO");
                        insight.setCategoria(nomeCategoria);
                        insight.setTitulo("Tendência de aumento");
                        insight.setMensagem(String.format(
                                "Seus gastos com '%s' têm aumentado consistentemente nos últimos 3 meses",
                                nomeCategoria));
                        insight.setPeriodo("últimos 3 meses");
                        
                        insights.add(insight);
                    }
                }
            }
        }
        
        return insights;
    }
    
    private List<InsightDTO> gerarInsightsEconomia(Usuario usuario) {
        List<InsightDTO> insights = new ArrayList<>();
        
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMesAtual = hoje.withDayOfMonth(1);
        LocalDate fimMesAtual = hoje.withDayOfMonth(hoje.lengthOfMonth());
        
        LocalDate inicioMesAnterior = inicioMesAtual.minusMonths(1);
        LocalDate fimMesAnterior = inicioMesAnterior.withDayOfMonth(inicioMesAnterior.lengthOfMonth());
        
        List<Transacao> transacoesMesAtual = transacaoRepository.findByUsuarioAndDataBetween(
                usuario, inicioMesAtual, fimMesAtual);
        
        List<Transacao> transacoesMesAnterior = transacaoRepository.findByUsuarioAndDataBetween(
                usuario, inicioMesAnterior, fimMesAnterior);
        
        BigDecimal totalDespesasMesAtual = transacoesMesAtual.stream()
                .filter(t -> "DESPESA".equals(t.getTipo()))
                .map(Transacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalDespesasMesAnterior = transacoesMesAnterior.stream()
                .filter(t -> "DESPESA".equals(t.getTipo()))
                .map(Transacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalDespesasMesAnterior.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal economia = totalDespesasMesAnterior.subtract(totalDespesasMesAtual);
            
            if (economia.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentualEconomia = economia.divide(totalDespesasMesAnterior, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                
                InsightDTO insight = new InsightDTO();
                insight.setTipo("SUCESSO");
                insight.setTitulo("Parabéns! Você economizou este mês");
                insight.setMensagem(String.format(
                        "Você gastou R$ %.2f a menos este mês em comparação com o mês anterior (%.2f%% de economia)",
                        economia, percentualEconomia));
                insight.setValorAtual(totalDespesasMesAtual);
                insight.setValorComparacao(totalDespesasMesAnterior);
                insight.setPercentualVariacao(percentualEconomia.negate());
                insight.setPeriodo("mês anterior");
                
                insights.add(insight);
            }
        }
        
        return insights;
    }
    
    private Map<Long, BigDecimal> agruparGastosPorCategoria(List<Transacao> transacoes) {
        Map<Long, BigDecimal> gastosPorCategoria = new HashMap<>();
        
        for (Transacao transacao : transacoes) {
            if ("DESPESA".equals(transacao.getTipo()) && transacao.getCategoria() != null) {
                Long categoriaId = transacao.getCategoria().getId();
                gastosPorCategoria.merge(categoriaId, transacao.getValor(), BigDecimal::add);
            }
        }
        
        return gastosPorCategoria;
    }
    
    private BigDecimal calcularDesvioPadrao(List<BigDecimal> valores, BigDecimal media) {
        if (valores.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal somaQuadradosDiferencas = valores.stream()
                .map(v -> v.subtract(media).pow(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal variancia = somaQuadradosDiferencas.divide(
                BigDecimal.valueOf(valores.size()), 2, RoundingMode.HALF_UP);
        
        return BigDecimal.valueOf(Math.sqrt(variancia.doubleValue()));
    }
}
