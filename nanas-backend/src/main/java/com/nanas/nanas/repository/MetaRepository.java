package com.nanas.nanas.repository;

import com.nanas.nanas.model.Meta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MetaRepository extends JpaRepository<Meta, Long> {
    
    List<Meta> findByUsuarioIdAndAtivaTrue(Long usuarioId);
    
    List<Meta> findByUsuarioId(Long usuarioId);
    
    List<Meta> findByUsuarioIdAndCategoriaId(Long usuarioId, Long categoriaId);
    
    @Query("SELECT m FROM Meta m WHERE m.usuario.id = :usuarioId " +
           "AND m.dataInicio <= :data AND m.dataFim >= :data AND m.ativa = true")
    List<Meta> findMetasAtivasNoPeriodo(@Param("usuarioId") Long usuarioId, @Param("data") LocalDate data);
    
    @Query("SELECT m FROM Meta m WHERE m.usuario.id = :usuarioId " +
           "AND m.categoria.id = :categoriaId AND m.dataInicio <= :data " +
           "AND m.dataFim >= :data AND m.ativa = true")
    Meta findMetaAtivaPorCategoriaEPeriodo(@Param("usuarioId") Long usuarioId, 
                                           @Param("categoriaId") Long categoriaId, 
                                           @Param("data") LocalDate data);
}
