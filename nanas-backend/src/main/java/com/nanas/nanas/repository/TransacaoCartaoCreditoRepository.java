package com.nanas.nanas.repository;

import com.nanas.nanas.model.TransacaoCartaoCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransacaoCartaoCreditoRepository extends JpaRepository<TransacaoCartaoCredito, Long> {

    List<TransacaoCartaoCredito> findByCartaoCreditoIdAndUsuarioId(Long cartaoCreditoId, Long usuarioId);

    List<TransacaoCartaoCredito> findAllByCartaoCreditoIdAndUsuarioIdAndDataCompraBetween(
            Long cartaoCreditoId,
            Long usuarioId,
            LocalDate dataInicio,
            LocalDate dataFim
    );
}
