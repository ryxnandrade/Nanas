package com.nanas.nanas.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransacaoRecorrenteRequest {
    
    @NotNull(message = "Descrição é obrigatória")
    private String descricao;
    
    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser positivo")
    private BigDecimal valor;
    
    @NotNull(message = "Tipo é obrigatório")
    private String tipo;
    
    @NotNull(message = "Frequência é obrigatória")
    private String frequencia;
    
    private Integer diaVencimento;
    
    @NotNull(message = "Data de início é obrigatória")
    private LocalDate dataInicio;
    
    private LocalDate dataFim;
    
    @NotNull(message = "Carteira é obrigatória")
    private Long carteiraId;
    
    private Long categoriaId;
}
