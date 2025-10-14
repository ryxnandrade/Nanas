package com.nanas.nanas.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.nanas.nanas.model.Usuario;
import com.nanas.nanas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario registrarUsuarioFirebase(String email, String senha, String nome ) throws FirebaseAuthException {
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(senha);

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);

        Usuario novoUsuario = new Usuario();
        novoUsuario.setEmail(userRecord.getEmail());
        novoUsuario.setNome(nome);
        novoUsuario.setFirebaseUid(userRecord.getUid());
        return usuarioRepository.save(novoUsuario);
    }

    public Usuario verificarIdTokenFirebase(String idToken, String nome) throws FirebaseAuthException {
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        String firebaseUid = decodedToken.getUid();

        Optional<Usuario> usuarioExistente = usuarioRepository.findByFirebaseUid(firebaseUid);
        if (usuarioExistente.isPresent()) {
            return usuarioExistente.get();
        }
        Usuario novoUsuario = new Usuario();
        novoUsuario.setEmail(decodedToken.getEmail());
        novoUsuario.setFirebaseUid(firebaseUid);
        novoUsuario.setNome(nome != null && !nome.isEmpty() ? nome : decodedToken.getEmail());

        return usuarioRepository.save(novoUsuario);
    }

    public Usuario findByFirebaseUid(String firebaseUid) {
        return usuarioRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
}
