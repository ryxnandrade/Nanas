package com.nanas.nanas.controller;

import com.google.firebase.auth.FirebaseAuthException;
import com.nanas.nanas.dto.IdTokenRequest;
import com.nanas.nanas.dto.RegistroRequest;
import com.nanas.nanas.dto.UsuarioResponse;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth" )
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistroRequest request) {
        try {
            Usuario novoUsuario = authService.registrarUsuarioFirebase(request.getEmail(), request.getSenha(), request.getNome());
            UsuarioResponse response = new UsuarioResponse(novoUsuario.getId(), novoUsuario.getNome(), novoUsuario.getEmail(), novoUsuario.getFirebaseUid());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (FirebaseAuthException e) {
            return new ResponseEntity<>("Erro ao registrar no Firebase: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody IdTokenRequest request) {
        try {
            String idToken = request.getIdToken();
            String nome = request.getName(); 

            if (idToken == null || idToken.trim().isEmpty()) {
                return new ResponseEntity<>("ID Token não fornecido.", HttpStatus.BAD_REQUEST);
            }

            Usuario usuario = authService.verificarIdTokenFirebase(idToken, nome);

            UsuarioResponse response = new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getFirebaseUid());
            
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (FirebaseAuthException e) {
            return new ResponseEntity<>("Token inválido ou expirado: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("Erro interno ao verificar o token: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
