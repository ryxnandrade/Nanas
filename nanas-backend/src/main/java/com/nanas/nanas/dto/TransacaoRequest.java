package com.nanas.nanas.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * DTO para criação e atualização de transações.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoRequest {

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    private String descricao;

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser positivo")
    private BigDecimal valor;

    @NotBlank(message = "Tipo é obrigatório")
    private String tipo;

    @NotBlank(message = "Data é obrigatória")
    private String data;

    @NotNull(message = "Carteira de origem é obrigatória")
    private Long carteiraOrigemId;

    private Long carteiraDestinoId;

    private Long categoriaId;
}
