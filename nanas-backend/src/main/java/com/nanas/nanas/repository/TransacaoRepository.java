package com.nanas.nanas.repository;

import com.nanas.nanas.model.Transacao;
import com.nanas.nanas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    List<Transacao> findByUsuarioOrderByDataDesc(Usuario usuario);
}

