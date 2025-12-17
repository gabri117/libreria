package com.libreria.libreria.controller;

import com.libreria.libreria.dto.UbicacionDTO;
import com.libreria.libreria.service.UbicacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ubicaciones")
@CrossOrigin(origins = "*")
public class UbicacionController {

    private final UbicacionService ubicacionService;

    @Autowired
    public UbicacionController(UbicacionService ubicacionService) {
        this.ubicacionService = ubicacionService;
    }

    @GetMapping
    public ResponseEntity<List<UbicacionDTO>> listar() {
        return ResponseEntity.ok(ubicacionService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UbicacionDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ubicacionService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<UbicacionDTO> crear(@Valid @RequestBody UbicacionDTO dto) {
        return new ResponseEntity<>(ubicacionService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UbicacionDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody UbicacionDTO dto) {
        return ResponseEntity.ok(ubicacionService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        ubicacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
