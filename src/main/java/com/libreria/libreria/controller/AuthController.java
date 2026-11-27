package com.libreria.libreria.controller;

import com.libreria.libreria.dto.AuthResponseDTO;
import com.libreria.libreria.dto.LoginDTO;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.security.JwtService;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            log.info("Iniciando login para usuario: {}", loginDTO.getUsername());
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDTO.getUsername(),
                            loginDTO.getPassword()));

            Usuario usuario = (Usuario) authentication.getPrincipal();
            String jwtToken = jwtService.generateToken(usuario);

            AuthResponseDTO response = AuthResponseDTO.builder()
                    .usuarioId(usuario.getUsuarioId())
                    .username(usuario.getUsername())
                    .nombreCompleto(usuario.getNombreCompleto())
                    .rol(usuario.getRol().getNombre())
                    .token(jwtToken)
                    .build();

            return ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.warn("Error de autenticación para {}: {}", loginDTO.getUsername(), e.getMessage());
            return ResponseEntity.status(401).body("Credenciales inválidas o cuenta desactivada");
        } catch (Exception e) {
            log.error("Error inesperado en login para {}", loginDTO.getUsername(), e);
            return ResponseEntity.status(500).body("Error interno del servidor");
        }
    }
}
