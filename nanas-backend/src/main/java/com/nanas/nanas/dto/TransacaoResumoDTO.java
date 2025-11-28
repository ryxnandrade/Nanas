package com.nanas.nanas.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransacaoResumoDTO {
    private String descricao;
    private BigDecimal valor;
    private String tipo;
    private LocalDate data;
    private String categoria;
}
