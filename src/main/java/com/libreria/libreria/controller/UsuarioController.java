package com.libreria.libreria.controller;

import com.libreria.libreria.dto.CreateUsuarioDTO;
import com.libreria.libreria.dto.UpdateUsuarioDTO;
import com.libreria.libreria.dto.UsuarioDTO;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> obtenerUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerUsuarios());
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> crearUsuario(@Valid @RequestBody CreateUsuarioDTO dto) {
        return new ResponseEntity<>(usuarioService.crearUsuario(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> actualizarUsuario(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateUsuarioDTO dto,
            @AuthenticationPrincipal Usuario admin) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, dto, admin.getUsuarioId()));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<UsuarioDTO> cambiarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> payload,
            @AuthenticationPrincipal Usuario admin) {
        Boolean activo = payload.get("activo");
        if (activo == null) {
            throw new IllegalArgumentException("El campo 'activo' es requerido");
        }
        return ResponseEntity.ok(usuarioService.cambiarEstado(id, activo, admin.getUsuarioId()));
    }
}
