package com.nanas.nanas.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoResponse {
    private Long id;
    private String descricao;
    private BigDecimal valor;
    private String tipo;
    private String data;
    private Long carteiraOrigemId;
    private String carteiraOrigemNome;
    private Long carteiraDestinoId;
    private String carteiraDestinoNome;
    private Long categoriaId;
    private String categoriaNome;
}

