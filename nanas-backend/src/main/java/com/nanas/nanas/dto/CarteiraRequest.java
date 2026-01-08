package com.nanas.nanas.dto;

import com.nanas.nanas.model.enums.TipoCarteira;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PositiveOrZero;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * DTO para criação e atualização de carteiras.
 */
@Data
public class CarteiraRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String nome;

    @PositiveOrZero(message = "Saldo deve ser positivo ou zero")
    private BigDecimal saldo;

    @NotNull(message = "Tipo de carteira é obrigatório")
    private TipoCarteira tipo;
}
