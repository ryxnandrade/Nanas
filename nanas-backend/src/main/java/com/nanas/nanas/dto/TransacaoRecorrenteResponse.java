package com.nanas.nanas.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransacaoRecorrenteResponse {
    private Long id;
    private String descricao;
    private BigDecimal valor;
    private String tipo;
    private String frequencia;
    private Integer diaVencimento;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private LocalDate proximaExecucao;
    private Boolean ativa;
    private Long carteiraId;
    private String carteiraNome;
    private Long categoriaId;
    private String categoriaNome;
}
