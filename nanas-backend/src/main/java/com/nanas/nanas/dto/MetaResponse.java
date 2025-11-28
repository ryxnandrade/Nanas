package com.nanas.nanas.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import com.nanas.nanas.model.Meta;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MetaResponse {
    private Long id;
    private String nome;
    private BigDecimal valorMeta;
    private BigDecimal valorAtual;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String periodo;
    private Boolean ativa;
    private Long categoriaId;
    private String categoriaNome;
    private BigDecimal percentualAtingido;

    public static MetaResponse fromEntity(Meta meta) {
        BigDecimal percentual = meta.getValorMeta().compareTo(BigDecimal.ZERO) > 0
                ? meta.getValorAtual().multiply(new BigDecimal(100)).divide(meta.getValorMeta(), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new MetaResponse(
                meta.getId(),
                meta.getNome(),
                meta.getValorMeta(),
                meta.getValorAtual(),
                meta.getDataInicio(),
                meta.getDataFim(),
                meta.getPeriodo().name(),
                meta.getAtiva(),
                meta.getCategoria() != null ? meta.getCategoria().getId() : null,
                meta.getCategoria() != null ? meta.getCategoria().getNome() : "Sem Categoria",
                percentual
        );
    }
}
