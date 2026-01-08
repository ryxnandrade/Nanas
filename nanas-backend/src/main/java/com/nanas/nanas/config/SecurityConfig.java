package com.nanas.nanas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuração de segurança do Spring Security.
 * Protege todos os endpoints exceto /api/auth/** que são públicos.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final FirebaseAuthenticationFilter firebaseAuthenticationFilter;

    public SecurityConfig(FirebaseAuthenticationFilter firebaseAuthenticationFilter) {
        this.firebaseAuthenticationFilter = firebaseAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Habilita CORS com a configuração customizada
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Desabilita CSRF pois usamos tokens JWT (stateless)
                .csrf(csrf -> csrf.disable())

                // Configura sessão como stateless (sem cookies de sessão)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configura autorização de requisições
                .authorizeHttpRequests(authz -> authz
                        // Endpoints públicos (autenticação)
                        .antMatchers("/api/auth/**").permitAll()
                        // Health check para deploy
                        .antMatchers("/actuator/health").permitAll()
                        // Todos os outros endpoints requerem autenticação
                        .anyRequest().authenticated())

                // Adiciona filtro Firebase antes do filtro de autenticação padrão
                .addFilterBefore(firebaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuração CORS para permitir requisições do frontend.
     * Permite localhost:5173 em desenvolvimento.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Permite localhost para desenvolvimento
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Headers expostos
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Tempo de cache do preflight
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}
