package com.nanas.nanas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http ) throws Exception {
        http
            // Desabilita CSRF
            .csrf(csrf -> csrf.disable( ))
            
            // Autoriza TODAS as requisições, sem exceção
            .authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll()
            );

        return http.build( );
    }
}
