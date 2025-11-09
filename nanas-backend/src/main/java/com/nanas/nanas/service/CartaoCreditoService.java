package com.nanas.nanas.service;

import com.nanas.nanas.dto.CartaoCreditoDTO;
import com.nanas.nanas.exception.ResourceNotFoundException;
import com.nanas.nanas.mapper.CartaoCreditoMapper;
import com.nanas.nanas.model.CartaoCredito;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.CartaoCreditoRepository;
import com.nanas.nanas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartaoCreditoService {

    private final CartaoCreditoRepository cartaoCreditoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CartaoCreditoMapper cartaoCreditoMapper;

    @Autowired
    public CartaoCreditoService(CartaoCreditoRepository cartaoCreditoRepository,
                                UsuarioRepository usuarioRepository,
                                CartaoCreditoMapper cartaoCreditoMapper) {
        this.cartaoCreditoRepository = cartaoCreditoRepository;
        this.usuarioRepository = usuarioRepository;
        this.cartaoCreditoMapper = cartaoCreditoMapper;
    }

    @Transactional
    public CartaoCreditoDTO create(CartaoCreditoDTO cartaoCreditoDTO) {
        Usuario usuario = usuarioRepository.findById(cartaoCreditoDTO.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com ID " + cartaoCreditoDTO.getUsuarioId() + " não encontrado."));

        CartaoCredito cartaoCredito = cartaoCreditoMapper.toEntity(cartaoCreditoDTO);
        cartaoCredito.setUsuario(usuario);

        CartaoCredito cartaoSalvo = cartaoCreditoRepository.save(cartaoCredito);

        return cartaoCreditoMapper.toDTO(cartaoSalvo);
    }

    @Transactional(readOnly = true)
    public List<CartaoCreditoDTO> getByUsuario(Long usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuário com ID " + usuarioId + " não encontrado.");
        }

        return cartaoCreditoRepository.findByUsuarioId(usuarioId).stream()
                .map(cartaoCreditoMapper::toDTO)
                .collect(Collectors.toList());
    }
}
