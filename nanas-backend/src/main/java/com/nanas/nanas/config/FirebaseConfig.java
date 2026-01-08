package com.nanas.nanas.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Configuração do Firebase Admin SDK.
 * Suporta credenciais via variável de ambiente (produção) ou arquivo
 * (desenvolvimento).
 */
@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        InputStream serviceAccount = getFirebaseCredentials();

        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        // Evita erro de reinicialização em ambiente de desenvolvimento
        if (FirebaseApp.getApps().isEmpty()) {
            logger.info("Inicializando Firebase App...");
            return FirebaseApp.initializeApp(options);
        } else {
            logger.info("Firebase App já inicializado, reutilizando instância.");
            return FirebaseApp.getInstance();
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }

    /**
     * Obtém as credenciais do Firebase de uma das seguintes fontes (em ordem de
     * prioridade):
     * 1. Variável de ambiente GOOGLE_APPLICATION_CREDENTIALS_JSON (para produção)
     * 2. Arquivo firebase-adminsdk.json no classpath (para desenvolvimento)
     */
    private InputStream getFirebaseCredentials() throws IOException {
        // Tenta ler da variável de ambiente primeiro (produção)
        String credentialsJson = System.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON");

        if (credentialsJson != null && !credentialsJson.isEmpty()) {
            logger.info("Usando credenciais Firebase da variável de ambiente.");
            return new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8));
        }

        // Fallback: lê do arquivo no classpath (desenvolvimento)
        logger.info("Usando credenciais Firebase do arquivo no classpath.");
        return new ClassPathResource("firebase-adminsdk.json").getInputStream();
    }
}
