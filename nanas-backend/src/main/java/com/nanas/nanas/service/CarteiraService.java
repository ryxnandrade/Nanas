package com.nanas.nanas.service;

import com.nanas.nanas.dto.CarteiraRequest;
import com.nanas.nanas.dto.CarteiraResponse;
import com.nanas.nanas.model.Carteira;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.CarteiraRepository;
import com.nanas.nanas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarteiraService {

    @Autowired
    private CarteiraRepository carteiraRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

        public CarteiraResponse criarCarteira(Long usuarioId, CarteiraRequest request ) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Carteira carteira = new Carteira();
        carteira.setNome(request.getNome());
        
        carteira.setTipo(request.getTipo()); 

        carteira.setSaldo(request.getSaldo() != null ? request.getSaldo() : BigDecimal.ZERO);
        
        carteira.setUsuario(usuario);

        carteira = carteiraRepository.save(carteira);
        
    
        return new CarteiraResponse(carteira); 
    }

    public List<CarteiraResponse> buscarCarteirasPorUsuario(Long usuarioId) {
        List<Carteira> carteiras = carteiraRepository.findByUsuarioId(usuarioId);
        return carteiras.stream().map(CarteiraResponse::new).collect(Collectors.toList());
    }

    public List<CarteiraResponse> buscarTodasCarteiras() {
        List<Carteira> carteiras = carteiraRepository.findAll();
        return carteiras.stream().map(this::toCarteiraResponse).collect(Collectors.toList());
    }

    public CarteiraResponse buscarCarteiraPorId(Long usuarioId, Long carteiraId) {
        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carteira não encontrada"));
        if (!carteira.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta carteira");
        }
        return toCarteiraResponse(carteira);
    }

    public CarteiraResponse atualizarCarteira(Long usuarioId, Long carteiraId, CarteiraRequest request) {
        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carteira não encontrada"));
        if (!carteira.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta carteira");
        }

        carteira.setNome(request.getNome());

        carteira = carteiraRepository.save(carteira);
        return toCarteiraResponse(carteira);
    }

    public void deletarCarteira(Long usuarioId, Long carteiraId) {
        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carteira não encontrada"));
        if (!carteira.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta carteira");
        }
        carteiraRepository.delete(carteira);
    }

    public void atualizarSaldoCarteira(Long carteiraId, BigDecimal valor, boolean isCredito) {
        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carteira não encontrada"));
        if (isCredito) {
            carteira.setSaldo(carteira.getSaldo().add(valor));
        } else {
            carteira.setSaldo(carteira.getSaldo().subtract(valor));
        }
        carteiraRepository.save(carteira);
    }

    public void transferirEntreCarteiras(Long usuarioId, Long carteiraOrigemId, Long carteiraDestinoId, BigDecimal valor, String descricao) {
        if (valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O valor da transferência deve ser positivo");
        }

        Carteira carteiraOrigem = carteiraRepository.findById(carteiraOrigemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carteira de origem não encontrada"));
        Carteira carteiraDestino = carteiraRepository.findById(carteiraDestinoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carteira de destino não encontrada"));

        if (!carteiraOrigem.getUsuario().getId().equals(usuarioId) || !carteiraDestino.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a uma das carteiras");
        }

        if (carteiraOrigem.getSaldo().compareTo(valor) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saldo insuficiente na carteira de origem");
        }

        carteiraOrigem.setSaldo(carteiraOrigem.getSaldo().subtract(valor));
        carteiraDestino.setSaldo(carteiraDestino.getSaldo().add(valor));

        carteiraRepository.save(carteiraOrigem);
        carteiraRepository.save(carteiraDestino);

    }

    private CarteiraResponse toCarteiraResponse(Carteira carteira) {
        CarteiraResponse response = new CarteiraResponse();
        response.setId(carteira.getId());
        response.setNome(carteira.getNome());

        response.setSaldo(carteira.getSaldo());
        return response;
    }
}

