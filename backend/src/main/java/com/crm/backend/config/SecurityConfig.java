package com.crm.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/auth/login", "/auth/register",
                                "/auth/forgot-password", "/auth/verify-reset-code",
                                "/auth/reset-password", "/api/chat",
                                "/licenses/**" , "/api/stripe/**" ,
                                "/auth/update-profile"
                        ).permitAll()
                        .requestMatchers("/admin/users/clients").hasAnyRole("ADMIN", "SALES", "FINANCE", "TECH")
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/sales/invoices/client/**").hasAnyRole("CLIENT", "ADMIN", "FINANCE")
                        .requestMatchers("/sales/invoices/**").hasAnyRole("SALES", "ADMIN", "FINANCE")
                        .requestMatchers("/sales/**").hasRole("SALES")
                        .requestMatchers("/finance/**").hasRole("FINANCE")
                        .requestMatchers("/tech/**").hasRole("TECH")
                        .requestMatchers("/client/**").hasRole("CLIENT")
                        .requestMatchers("/licenses/tech/**").hasAnyRole("TECH", "ADMIN")
                        .requestMatchers("/licenses/**").permitAll()
                        .requestMatchers("/api/ai-analysis/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
