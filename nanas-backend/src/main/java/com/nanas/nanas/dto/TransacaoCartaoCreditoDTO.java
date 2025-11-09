package com.nanas.nanas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonFormat;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransacaoCartaoCreditoDTO {

    private Long id;

    @NotBlank(message = "A descrição não pode ser nula ou vazia.")
    private String descricao;

    @NotNull(message = "O valor não pode ser nulo.")
    @Positive(message = "O valor da transação deve ser positivo.")
    private BigDecimal valor;

    @NotNull(message = "A data da compra não pode ser nula.")
    @JsonFormat(pattern="yyyy-MM-dd") 
    private LocalDate dataCompra;

    private Long cartaoCreditoId;

    private Long categoriaId;

    private Long usuarioId;
}
