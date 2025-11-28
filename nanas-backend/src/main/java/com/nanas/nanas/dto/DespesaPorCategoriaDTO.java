package com.nanas.nanas.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class DespesaPorCategoriaDTO {

    private String nome;
    private BigDecimal valor;
    private BigDecimal percentual;
    
    public DespesaPorCategoriaDTO(String categoria, BigDecimal valor, BigDecimal percentual) {
        this.nome = categoria;
        this.valor = valor;
        this.percentual = percentual;
    }
    
    // Getter para compatibilidade com código existente
    public String getCategoria() {
        return nome;
    }
}
