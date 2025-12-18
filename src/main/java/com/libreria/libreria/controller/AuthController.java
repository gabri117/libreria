package com.libreria.libreria.controller;

import com.libreria.libreria.dto.AuthResponseDTO;
import com.libreria.libreria.dto.LoginDTO;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.security.JwtService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            System.out.println("Iniciando login para: " + loginDTO.getUsername());
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
            System.err.println("Error de autenticación para " + loginDTO.getUsername() + ": " + e.getMessage());
            return ResponseEntity.status(401).body("Credenciales inválidas o cuenta desactivada");
        } catch (Exception e) {
            System.err.println("Error inesperado en login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error interno del servidor");
        }
    }
}
