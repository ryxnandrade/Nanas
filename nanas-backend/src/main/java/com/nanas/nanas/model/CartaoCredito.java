package com.nanas.nanas.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cartoes_credito")
@Data
@EqualsAndHashCode(callSuper = true)
public class CartaoCredito extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private BigDecimal limite;

    private Integer diaFechamento;

    private Integer diaVencimento;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
