package com.libreria.libreria.controller;

import com.libreria.libreria.dto.AperturaCajaDTO;
import com.libreria.libreria.dto.CierreCajaDTO;
import com.libreria.libreria.dto.SesionCajaDTO;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.service.SesionCajaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sesiones")
public class SesionCajaController {

    private final SesionCajaService sesionCajaService;

    @Autowired
    public SesionCajaController(SesionCajaService sesionCajaService) {
        this.sesionCajaService = sesionCajaService;
    }

    @GetMapping("/activa")
    public ResponseEntity<SesionCajaDTO> obtenerSesionActiva(
            @RequestParam(required = false) Integer usuarioId,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {
        SesionCajaDTO sesion = sesionCajaService.obtenerSesionActiva(usuarioAutenticado.getUsuarioId());
        if (sesion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sesion);
    }

    @PostMapping("/abrir")
    public ResponseEntity<SesionCajaDTO> abrirSesion(
            @Valid @RequestBody AperturaCajaDTO dto,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {
        dto.setUsuarioId(usuarioAutenticado.getUsuarioId());
        return new ResponseEntity<>(sesionCajaService.abrirSesion(dto), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/cerrar")
    public ResponseEntity<SesionCajaDTO> cerrarSesion(
            @PathVariable Integer id,
            @Valid @RequestBody CierreCajaDTO dto,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {
        dto.setUsuarioId(usuarioAutenticado.getUsuarioId());
        return ResponseEntity.ok(sesionCajaService.cerrarSesion(id, dto));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<SesionCajaDTO>> listarHistorial(
            @AuthenticationPrincipal Usuario usuarioAutenticado) {
        boolean esAdmin = usuarioAutenticado.getRol() != null
                && "Administrador".equalsIgnoreCase(usuarioAutenticado.getRol().getNombre());
        return ResponseEntity.ok(
                sesionCajaService.listarHistorialSesiones(usuarioAutenticado.getUsuarioId(), esAdmin));
    }
}
