package com.nanas.nanas.service;

import com.nanas.nanas.dto.CategoriaRequest;
import com.nanas.nanas.dto.CategoriaResponse;
import com.nanas.nanas.model.Categoria;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.CategoriaRepository;
import com.nanas.nanas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public CategoriaResponse criarCategoria(Long usuarioId, CategoriaRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Categoria categoria = new Categoria();
        categoria.setNome(request.getNome());
        categoria.setUsuario(usuario);

        categoria = categoriaRepository.save(categoria);
        return toCategoriaResponse(categoria);
    }

    public List<CategoriaResponse> buscarCategoriasPorUsuario(Long usuarioId) {
        List<Categoria> categorias = categoriaRepository.findByUsuarioId(usuarioId);
        return categorias.stream().map(this::toCategoriaResponse).collect(Collectors.toList());
    }

    public List<CategoriaResponse> buscarTodasCategorias() {
        List<Categoria> categorias = categoriaRepository.findAll();
        return categorias.stream().map(this::toCategoriaResponse).collect(Collectors.toList());
    }

    public CategoriaResponse buscarCategoriaPorId(Long usuarioId, Long categoriaId) {
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));
        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta categoria");
        }
        return toCategoriaResponse(categoria);
    }

    public CategoriaResponse atualizarCategoria(Long usuarioId, Long categoriaId, CategoriaRequest request) {
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));
        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta categoria");
        }

        categoria.setNome(request.getNome());

        categoria = categoriaRepository.save(categoria);
        return toCategoriaResponse(categoria);
    }

    public void deletarCategoria(Long usuarioId, Long categoriaId) {
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));
        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta categoria");
        }
        categoriaRepository.delete(categoria);
    }

    private CategoriaResponse toCategoriaResponse(Categoria categoria) {
        CategoriaResponse response = new CategoriaResponse();
        response.setId(categoria.getId());
        response.setNome(categoria.getNome());
        return response;
    }
}

