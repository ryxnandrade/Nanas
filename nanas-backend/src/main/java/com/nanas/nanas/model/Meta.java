package com.nanas.nanas.model;

import javax.persistence.*;

import com.nanas.nanas.model.enums.PeriodoMeta;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "metas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Meta extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private BigDecimal valorMeta;
    private BigDecimal valorAtual = BigDecimal.ZERO;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    
    @Enumerated(EnumType.STRING) 
    private PeriodoMeta periodo;
    
    private Boolean ativa = true;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = true)
    private Categoria categoria;
    
    public BigDecimal getPercentualAtingido() {
        if (valorMeta == null || valorMeta.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (valorAtual == null) {
            return BigDecimal.ZERO;
        }
        return valorAtual.multiply(BigDecimal.valueOf(100)).divide(valorMeta, 2, java.math.RoundingMode.HALF_UP);
    }
}
