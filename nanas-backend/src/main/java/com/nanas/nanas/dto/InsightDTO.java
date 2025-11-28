package com.nanas.nanas.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InsightDTO {
    private String tipo; // ALERTA, INFORMACAO, SUCESSO
    private String categoria;
    private String titulo;
    private String mensagem;
    private BigDecimal valorAtual;
    private BigDecimal valorComparacao;
    private BigDecimal percentualVariacao;
    private String periodo;
}
