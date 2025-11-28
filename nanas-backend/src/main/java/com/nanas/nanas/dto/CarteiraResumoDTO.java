package com.nanas.nanas.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarteiraResumoDTO {
    private String nome;
    private String tipo;
    private BigDecimal saldo;
}
