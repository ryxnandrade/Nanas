package com.nanas.nanas.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MetaRequest {
    
    @NotNull(message = "Nome é obrigatório")
    private String nome;
    
    @NotNull(message = "Valor da meta é obrigatório")
    @Positive(message = "Valor da meta deve ser positivo")
    private BigDecimal valorMeta;
    
    @NotNull(message = "Data de início é obrigatória")
    private LocalDate dataInicio;
    
    @NotNull(message = "Data de fim é obrigatória")
    private LocalDate dataFim;
    
    @NotNull(message = "Período é obrigatório")
    private String periodo;

    private Long categoriaId;
}
