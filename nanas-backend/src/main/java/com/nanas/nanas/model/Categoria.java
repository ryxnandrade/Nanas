package com.nanas.nanas.model;

import javax.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "categorias")
public class Categoria extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}

