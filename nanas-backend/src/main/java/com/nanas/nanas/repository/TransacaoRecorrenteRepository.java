package com.nanas.nanas.repository;

import com.nanas.nanas.model.TransacaoRecorrente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransacaoRecorrenteRepository extends JpaRepository<TransacaoRecorrente, Long> {
    
    List<TransacaoRecorrente> findByUsuarioIdAndAtivaTrue(Long usuarioId);
    
    List<TransacaoRecorrente> findByUsuarioId(Long usuarioId);
    
    @Query("SELECT tr FROM TransacaoRecorrente tr WHERE tr.ativa = true " +
           "AND tr.proximaExecucao <= :data " +
           "AND (tr.dataFim IS NULL OR tr.dataFim >= :data)")
    List<TransacaoRecorrente> findTransacoesPendentesExecucao(@Param("data") LocalDate data);
    
    @Query("SELECT tr FROM TransacaoRecorrente tr WHERE tr.usuario.id = :usuarioId " +
           "AND tr.ativa = true AND tr.proximaExecucao <= :data " +
           "AND (tr.dataFim IS NULL OR tr.dataFim >= :data)")
    List<TransacaoRecorrente> findTransacoesPendentesExecucaoPorUsuario(
            @Param("usuarioId") Long usuarioId, 
            @Param("data") LocalDate data);
}
