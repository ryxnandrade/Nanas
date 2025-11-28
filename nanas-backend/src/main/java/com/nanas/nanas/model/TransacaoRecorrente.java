package com.nanas.nanas.model;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transacoes_recorrentes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoRecorrente extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String descricao;
    private BigDecimal valor;
    private String tipo; // RECEITA, DESPESA
    private String frequencia; // DIARIA, SEMANAL, MENSAL, ANUAL
    private Integer diaVencimento; // Dia do mês para recorrência mensal
    private LocalDate dataInicio;
    private LocalDate dataFim; // Pode ser null para recorrência indefinida
    private LocalDate proximaExecucao;
    private Boolean ativa;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "carteira_id", nullable = false)
    private Carteira carteira;
    
    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = true)
    private Categoria categoria;
}
