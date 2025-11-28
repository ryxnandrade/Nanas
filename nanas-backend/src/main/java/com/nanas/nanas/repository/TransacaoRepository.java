package com.nanas.nanas.repository;

import com.nanas.nanas.model.Transacao;
import com.nanas.nanas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nanas.nanas.model.Carteira;
import java.time.LocalDate;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    List<Transacao> findByUsuarioOrderByDataDesc(Usuario usuario);
    List<Transacao> findByUsuarioAndTipoAndDataBetween(Usuario usuario, String tipo, LocalDate dataInicio, LocalDate dataFim);
    List<Transacao> findByUsuarioAndCarteiraOrigemAndDataGreaterThanEqual(Usuario usuario, Carteira carteira, LocalDate data);
    List<Transacao> findByUsuarioAndCarteiraDestinoAndDataGreaterThanEqual(Usuario usuario, Carteira carteira, LocalDate data);
    List<Transacao> findByUsuarioAndCarteiraOrigemAndData(Usuario usuario, Carteira carteira, LocalDate data);
    List<Transacao> findByUsuarioAndCarteiraDestinoAndData(Usuario usuario, Carteira carteira, LocalDate data);
    List<Transacao> findByUsuarioAndDataBetween(Usuario usuario, LocalDate startDate, LocalDate endDate);
    List<Transacao> findByUsuarioAndDataBefore(Usuario usuario, LocalDate date);
    List<Transacao> findByUsuarioIdAndCategoria_IdAndDataBetween(Long usuarioId, Long categoriaId, LocalDate dataInicio, LocalDate dataFim);
}
    