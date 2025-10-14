package com.nanas.nanas.dto;

import com.nanas.nanas.model.enums.TipoCarteira; 
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CarteiraRequest {

    private String nome;
    private BigDecimal saldo; 
    private TipoCarteira tipo; 

}
