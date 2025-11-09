package com.nanas.nanas.repository;

import com.nanas.nanas.model.CartaoCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartaoCreditoRepository extends JpaRepository<CartaoCredito, Long> {

    List<CartaoCredito> findByUsuarioId(Long usuarioId);

    Optional<CartaoCredito> findByIdAndUsuarioId(Long id, Long usuarioId);

}
