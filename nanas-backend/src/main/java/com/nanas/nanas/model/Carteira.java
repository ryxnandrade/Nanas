package com.nanas.nanas.model;

import com.nanas.nanas.model.enums.TipoCarteira; 
import javax.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "carteiras")
public class Carteira {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private BigDecimal saldo;

    @Enumerated(EnumType.STRING) 
    @Column(nullable = false) 
    private TipoCarteira tipo;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
