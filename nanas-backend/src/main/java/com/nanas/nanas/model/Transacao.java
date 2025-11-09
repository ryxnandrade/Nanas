package com.nanas.nanas.model;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transacoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transacao extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descricao;
    private BigDecimal valor;
    private String tipo; 
    private LocalDate data;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "carteira_origem_id", nullable = false)
    private Carteira carteiraOrigem;

    @ManyToOne
    @JoinColumn(name = "carteira_destino_id", nullable = true)
    private Carteira carteiraDestino;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = true)
    private Categoria categoria;
}

