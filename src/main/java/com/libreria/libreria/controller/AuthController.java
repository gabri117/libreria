package com.libreria.libreria.controller;

import com.libreria.libreria.dto.AuthResponseDTO;
import com.libreria.libreria.dto.LoginDTO;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            Optional<Usuario> usuarioOpt = usuarioService.login(loginDTO);

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                AuthResponseDTO response = AuthResponseDTO.builder()
                        .usuarioId(usuario.getUsuarioId())
                        .username(usuario.getUsername())
                        .nombreCompleto(usuario.getNombreCompleto())
                        .rol(usuario.getRol().getNombre())
                        .token("dummy-token-for-mvp") // In real app, generate JWT here
                        .build();
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
