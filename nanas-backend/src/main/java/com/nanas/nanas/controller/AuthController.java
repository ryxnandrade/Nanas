package com.nanas.nanas.controller;

import com.google.firebase.auth.FirebaseAuthException;
import com.nanas.nanas.dto.IdTokenRequest;
import com.nanas.nanas.dto.UsuarioResponse;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth" )
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/verify-token")
    public ResponseEntity<?> syncUser(@RequestBody IdTokenRequest request) {
        try {
            String idToken = request.getIdToken();
            String nome = request.getName(); 

            if (idToken == null || idToken.trim().isEmpty()) {
                return new ResponseEntity<>("ID Token não fornecido.", HttpStatus.BAD_REQUEST);
            }

            Usuario usuario = authService.verificarIdTokenFirebaseESincronizar(idToken, nome);

            UsuarioResponse response = new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getFirebaseUid());
            
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (FirebaseAuthException e) {
            return new ResponseEntity<>("Token inválido ou expirado: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("Erro interno ao verificar o token: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
