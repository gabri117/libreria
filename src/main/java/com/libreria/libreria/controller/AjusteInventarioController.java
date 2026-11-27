package com.libreria.libreria.controller;

import com.libreria.libreria.dto.AjusteInventarioDTO;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.service.AjusteInventarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ajustes-inventario")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AjusteInventarioController {

    private final AjusteInventarioService ajusteInventarioService;

    public AjusteInventarioController(AjusteInventarioService ajusteInventarioService) {
        this.ajusteInventarioService = ajusteInventarioService;
    }

    @GetMapping
    public ResponseEntity<List<AjusteInventarioDTO>> listarAjustes() {
        return ResponseEntity.ok(ajusteInventarioService.listarAjustes());
    }

    @PostMapping
    public ResponseEntity<AjusteInventarioDTO> registrarAjuste(
            @Valid @RequestBody AjusteInventarioDTO dto,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {
        return new ResponseEntity<>(
                ajusteInventarioService.registrarAjuste(dto, usuarioAutenticado.getUsuarioId()),
                HttpStatus.CREATED);
    }
}
