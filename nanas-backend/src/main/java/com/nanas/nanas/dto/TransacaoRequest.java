package com.nanas.nanas.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoRequest {
    private String descricao;
    private BigDecimal valor;
    private String tipo;
    private String data;
    private Long carteiraOrigemId;
    private Long carteiraDestinoId;
    private Long categoriaId;
}

