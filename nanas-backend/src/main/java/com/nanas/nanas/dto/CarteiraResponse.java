package com.nanas.nanas.dto;

import com.nanas.nanas.model.Carteira; 
import com.nanas.nanas.model.enums.TipoCarteira;
import lombok.Data;
import lombok.NoArgsConstructor; 

import java.math.BigDecimal;

@Data
@NoArgsConstructor 
public class CarteiraResponse {
    private Long id;
    private String nome;
    private BigDecimal saldo; 
    private TipoCarteira tipo; 

    public CarteiraResponse(Carteira carteira) {
        this.id = carteira.getId();
        this.nome = carteira.getNome();
        this.saldo = carteira.getSaldo();
        this.tipo = carteira.getTipo();
    }
}
