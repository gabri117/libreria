package com.libreria.libreria.controller;

import com.libreria.libreria.dto.CreateUsuarioDTO;
import com.libreria.libreria.dto.UsuarioDTO;
import com.libreria.libreria.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
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
}
