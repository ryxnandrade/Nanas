package com.nanas.nanas.controller;

import com.google.firebase.auth.FirebaseAuthException;
import com.nanas.nanas.dto.IdTokenRequest;
import com.nanas.nanas.dto.RegistroRequest;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth" )
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistroRequest request) {
        try {
            Usuario novoUsuario = authService.registrarUsuarioFirebase(request.getEmail(), request.getSenha(), request.getNome());
            return new ResponseEntity<>(novoUsuario, HttpStatus.CREATED);
        } catch (FirebaseAuthException e) {
            return new ResponseEntity<>("Erro ao registrar no Firebase: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody IdTokenRequest request) {
        try {
            String idToken = request.getIdToken();
            String nome = request.getName(); 

            if (idToken == null || idToken.isEmpty()) {
                return new ResponseEntity<>("ID Token não fornecido.", HttpStatus.BAD_REQUEST);
            }
            Optional<Usuario> usuarioOptional = authService.verificarIdTokenFirebase(idToken, nome);
            
            if (usuarioOptional.isPresent()) {
                return new ResponseEntity<>(usuarioOptional.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Usuário não encontrado ou não pôde ser criado.", HttpStatus.NOT_FOUND);
            }
        } catch (FirebaseAuthException e) {
            return new ResponseEntity<>("Token inválido: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("Erro interno ao verificar o token: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

