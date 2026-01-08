package com.nanas.nanas.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final FirebaseAuth firebaseAuth;

    @Autowired
    public AuthService(UsuarioRepository usuarioRepository, FirebaseAuth firebaseAuth) {
        this.usuarioRepository = usuarioRepository;
        this.firebaseAuth = firebaseAuth;
    }

    @Transactional
    public Usuario verificarIdTokenFirebaseESincronizar(String idToken, String nome) throws FirebaseAuthException {
        FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
        String uid = decodedToken.getUid();

        return usuarioRepository.findByFirebaseUid(uid)
                .stream().findFirst()
                .orElseGet(() -> {
                    Usuario novoUsuario = new Usuario();
                    novoUsuario.setFirebaseUid(uid);
                    novoUsuario.setEmail(decodedToken.getEmail());
                    novoUsuario.setNome(nome);
                    return usuarioRepository.save(novoUsuario);
                });
    }

    public Usuario findByFirebaseUid(String firebaseUid) {
        return usuarioRepository.findByFirebaseUid(firebaseUid)
                .stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Usuário com UID " + firebaseUid + " não encontrado no banco de dados local."));
    }
}
