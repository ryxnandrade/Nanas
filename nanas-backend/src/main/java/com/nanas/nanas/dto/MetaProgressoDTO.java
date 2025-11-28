package com.nanas.nanas.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MetaProgressoDTO {
    private String nomeCategoria;
    private BigDecimal valorMeta;
    private BigDecimal valorAtual;
    private BigDecimal percentualAtingido;
    private String status; // ATINGIDA, EM_PROGRESSO, EXCEDIDA
}
