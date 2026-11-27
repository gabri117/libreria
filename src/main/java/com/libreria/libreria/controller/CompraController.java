package com.libreria.libreria.controller;

import com.libreria.libreria.dto.CompraDTO;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.service.CompraService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @GetMapping
    public ResponseEntity<List<CompraDTO>> listarCompras() {
        return ResponseEntity.ok(compraService.listarCompras());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(compraService.obtenerCompraPorId(id));
    }

    @PostMapping
    public ResponseEntity<CompraDTO> registrarCompra(
            @Valid @RequestBody CompraDTO dto,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {
        return new ResponseEntity<>(
                compraService.registrarCompra(dto, usuarioAutenticado.getUsuarioId()),
                HttpStatus.CREATED);
    }
}
