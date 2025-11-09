package com.nanas.nanas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DespesaPorCategoriaDTO {

    private String nome;
    private BigDecimal valor;

}
