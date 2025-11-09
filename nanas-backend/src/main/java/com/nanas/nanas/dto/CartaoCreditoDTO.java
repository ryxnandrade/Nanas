package com.nanas.nanas.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartaoCreditoDTO {
    private Long id;
    private String nome;
    private BigDecimal limite;
    private Integer diaFechamento;
    private Integer diaVencimento;
    private Long usuarioId;
}
