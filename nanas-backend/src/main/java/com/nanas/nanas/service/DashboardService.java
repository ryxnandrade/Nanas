package com.nanas.nanas.service;

import com.nanas.nanas.dto.DespesaPorCategoriaDTO;
import com.nanas.nanas.dto.EvolucaoSaldoDTO;
import com.nanas.nanas.dto.TransacaoCartaoCreditoDTO;
import com.nanas.nanas.model.CartaoCredito;
import com.nanas.nanas.model.Carteira;
import com.nanas.nanas.model.Transacao;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.CartaoCreditoRepository;
import com.nanas.nanas.service.TransacaoCartaoCreditoService;
import com.nanas.nanas.repository.CarteiraRepository;
import com.nanas.nanas.repository.TransacaoRepository;
import com.nanas.nanas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.time.format.DateTimeFormatter; 

@Service
public class DashboardService {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private CarteiraRepository carteiraRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CartaoCreditoRepository cartaoCreditoRepository;

    @Autowired
    private TransacaoCartaoCreditoService transacaoCartaoCreditoService;

    public List<DespesaPorCategoriaDTO> getDespesasPorCategoria(Long usuarioId, LocalDate startDate, LocalDate endDate) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Transacao> transacoes = transacaoRepository.findByUsuarioAndTipoAndDataBetween(usuario, "DESPESA", startDate, endDate);

        Map<String, BigDecimal> despesasPorCategoria = transacoes.stream()
                .filter(t -> t.getCategoria() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategoria().getNome(),
                        Collectors.reducing(BigDecimal.ZERO, Transacao::getValor, BigDecimal::add)
                ));

return despesasPorCategoria.entrySet().stream()
        .map(entry -> new DespesaPorCategoriaDTO(entry.getKey(), entry.getValue())) 
        .sorted(Comparator.comparing(DespesaPorCategoriaDTO::getValor).reversed())
        .collect(Collectors.toList());
    }

public Map<String, Object> getSummary(Long usuarioId) {
    Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

    List<Carteira> carteiras = carteiraRepository.findByUsuario(usuario);
    BigDecimal saldoTotal = carteiras.stream()
            .map(Carteira::getSaldo)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    LocalDate hoje = LocalDate.now();
    LocalDate inicioMesAtual = hoje.withDayOfMonth(1);
    LocalDate fimMesAtual = hoje.withDayOfMonth(hoje.lengthOfMonth());
    
    LocalDate inicioMesAnterior = hoje.minusMonths(1).withDayOfMonth(1);
    LocalDate fimMesAnterior = inicioMesAnterior.withDayOfMonth(inicioMesAnterior.lengthOfMonth());

    List<Transacao> transacoesMesAtual = transacaoRepository.findByUsuarioAndDataBetween(usuario, inicioMesAtual, fimMesAtual);
    List<Transacao> transacoesMesAnterior = transacaoRepository.findByUsuarioAndDataBetween(usuario, inicioMesAnterior, fimMesAnterior);

    BigDecimal receitas = transacoesMesAtual.stream()
            .filter(t -> "RECEITA".equals(t.getTipo()))
            .map(Transacao::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal despesas = transacoesMesAtual.stream()
            .filter(t -> "DESPESA".equals(t.getTipo()))
            .map(Transacao::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal receitasMesAnterior = transacoesMesAnterior.stream()
            .filter(t -> "RECEITA".equals(t.getTipo()))
            .map(Transacao::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal despesasMesAnterior = transacoesMesAnterior.stream()
            .filter(t -> "DESPESA".equals(t.getTipo()))
            .map(Transacao::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            

        BigDecimal faturaCartao = BigDecimal.ZERO;  
        List<CartaoCredito> cartoesDoUsuario = cartaoCreditoRepository.findByUsuarioId(usuarioId);

        if (!cartoesDoUsuario.isEmpty()) {
            CartaoCredito primeiroCartao = cartoesDoUsuario.get(0);
            List<TransacaoCartaoCreditoDTO> transacoesFatura = transacaoCartaoCreditoService.getFaturaAtual(primeiroCartao.getId(), usuarioId);
        
        faturaCartao = transacoesFatura.stream()
                .map(TransacaoCartaoCreditoDTO::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return Map.of(
                "saldoTotal", saldoTotal,
                "receitas", receitas,
                "despesas", despesas,
                "receitasMesAnterior", receitasMesAnterior,
                "despesasMesAnterior", despesasMesAnterior,
                "cartoes", faturaCartao
        );
}
public List<EvolucaoSaldoDTO> getEvolucaoSaldo(Long usuarioId, LocalDate startDate, LocalDate endDate, Long carteiraId) {
    Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

    List<Transacao> transacoesAnteriores = transacaoRepository.findByUsuarioAndDataBefore(usuario, startDate);
    
    BigDecimal saldoInicial = BigDecimal.ZERO;
    for (Transacao t : transacoesAnteriores) {
        if ("RECEITA".equals(t.getTipo())) {
            saldoInicial = saldoInicial.add(t.getValor());
        } else if ("DESPESA".equals(t.getTipo())) {
            saldoInicial = saldoInicial.subtract(t.getValor());
        }
    }

    List<Transacao> transacoesDoPeriodo = transacaoRepository.findByUsuarioAndDataBetween(usuario, startDate, endDate);
    Map<LocalDate, List<Transacao>> transacoesAgrupadasPorDia = transacoesDoPeriodo.stream()
            .collect(Collectors.groupingBy(Transacao::getData));

    List<EvolucaoSaldoDTO> evolucao = new ArrayList<>();
    LocalDate dataCorrente = startDate;
    BigDecimal saldoCorrente = saldoInicial;
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM"); 

    while (!dataCorrente.isAfter(endDate)) {
        List<Transacao> transacoesDoDia = transacoesAgrupadasPorDia.getOrDefault(dataCorrente, new ArrayList<>());
        
        for (Transacao t : transacoesDoDia) {
            if ("RECEITA".equals(t.getTipo())) {
                saldoCorrente = saldoCorrente.add(t.getValor());
            } else if ("DESPESA".equals(t.getTipo())) {
                saldoCorrente = saldoCorrente.subtract(t.getValor());
            }
        }
        
        evolucao.add(new EvolucaoSaldoDTO(dataCorrente.format(formatter), saldoCorrente));
        dataCorrente = dataCorrente.plusDays(1);
    }

    return evolucao;
}
}
