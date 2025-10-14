package com.nanas.nanas.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferenciaRequest {
    private Long carteiraOrigemId;
    private Long carteiraDestinoId;
    private BigDecimal valor;
    private String descricao;
}

