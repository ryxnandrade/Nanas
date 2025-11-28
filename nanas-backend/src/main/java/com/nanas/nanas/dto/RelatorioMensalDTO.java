package com.nanas.nanas.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RelatorioMensalDTO {
    private YearMonth periodo;
    private BigDecimal totalReceitas;
    private BigDecimal totalDespesas;
    private BigDecimal saldoFinal;
    private BigDecimal variacaoMesAnterior;
    private BigDecimal percentualVariacao;
    private List<DespesaPorCategoriaDTO> despesasPorCategoria;
    private List<MetaProgressoDTO> progressoMetas;
    private List<TransacaoResumoDTO> maioresTransacoes;
    private ResumoCarteirasDTO resumoCarteiras;
    private String statusFinanceiro; // POSITIVO, NEUTRO, NEGATIVO
}
