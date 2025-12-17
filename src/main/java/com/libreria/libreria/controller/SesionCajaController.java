package com.libreria.libreria.controller;

import com.libreria.libreria.dto.AperturaCajaDTO;
import com.libreria.libreria.dto.CierreCajaDTO;
import com.libreria.libreria.dto.SesionCajaDTO;
import com.libreria.libreria.service.SesionCajaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sesiones")
@CrossOrigin(origins = "*")
public class SesionCajaController {

    private final SesionCajaService sesionCajaService;

    @Autowired
    public SesionCajaController(SesionCajaService sesionCajaService) {
        this.sesionCajaService = sesionCajaService;
    }

    @GetMapping("/activa")
    public ResponseEntity<SesionCajaDTO> obtenerSesionActiva(@RequestParam Integer usuarioId) {
        SesionCajaDTO sesion = sesionCajaService.obtenerSesionActiva(usuarioId);
        if (sesion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sesion);
    }

    @PostMapping("/abrir")
    public ResponseEntity<SesionCajaDTO> abrirSesion(@Valid @RequestBody AperturaCajaDTO dto) {
        return new ResponseEntity<>(sesionCajaService.abrirSesion(dto), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/cerrar")
    public ResponseEntity<SesionCajaDTO> cerrarSesion(@PathVariable Integer id, @Valid @RequestBody CierreCajaDTO dto) {
        return ResponseEntity.ok(sesionCajaService.cerrarSesion(id, dto));
    }
}
