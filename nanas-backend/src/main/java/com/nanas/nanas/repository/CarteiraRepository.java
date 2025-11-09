package com.nanas.nanas.repository;

import com.nanas.nanas.model.Carteira;
import com.nanas.nanas.model.Usuario; // Importe a classe Usuario
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarteiraRepository extends JpaRepository<Carteira, Long> {

    List<Carteira> findByUsuario(Usuario usuario);
    List<Carteira> findByUsuarioId(Long usuarioId);
}
