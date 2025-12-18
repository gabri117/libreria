package com.libreria.libreria.controller;

import com.libreria.libreria.dto.EstadisticasVentasDTO;
import com.libreria.libreria.dto.ProductoMasVendidoDTO;
import com.libreria.libreria.dto.VentaDTO;
import com.libreria.libreria.dto.VentasPorMetodoDTO;
import com.libreria.libreria.model.enums.EstadoVenta;
import com.libreria.libreria.model.enums.MetodoPago;
import com.libreria.libreria.service.VentaService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;

    @Autowired
    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @PostMapping
    public ResponseEntity<VentaDTO> registrarVenta(@Valid @RequestBody VentaDTO ventaDTO) {
        VentaDTO nuevaVenta = ventaService.crearVenta(ventaDTO);
        return new ResponseEntity<>(nuevaVenta, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VentaDTO>> listarVentas() {
        return new ResponseEntity<>(ventaService.listarVentas(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaDTO> obtenerVentaPorId(@PathVariable Integer id) {
        VentaDTO venta = ventaService.obtenerVentaPorId(id);
        return new ResponseEntity<>(venta, HttpStatus.OK);
    }

    @GetMapping("/filtrar")
    public ResponseEntity<List<VentaDTO>> filtrarVentas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(required = false) Integer clienteId,
            @RequestParam(required = false) MetodoPago metodoPago,
            @RequestParam(required = false) EstadoVenta estado) {
        List<VentaDTO> ventas = ventaService.filtrarVentas(fechaInicio, fechaFin, clienteId, metodoPago, estado);
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<VentaDTO> anularVenta(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        Integer usuarioId = (Integer) payload.get("usuarioId");
        String motivo = (String) payload.get("motivo");

        VentaDTO ventaAnulada = ventaService.anularVenta(id, usuarioId, motivo);
        return new ResponseEntity<>(ventaAnulada, HttpStatus.OK);
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasVentasDTO> obtenerEstadisticas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        EstadisticasVentasDTO estadisticas = ventaService.obtenerEstadisticas(fechaInicio, fechaFin);
        return new ResponseEntity<>(estadisticas, HttpStatus.OK);
    }

    @GetMapping("/productos-mas-vendidos")
    public ResponseEntity<List<ProductoMasVendidoDTO>> obtenerProductosMasVendidos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(required = false, defaultValue = "10") Integer limite) {
        List<ProductoMasVendidoDTO> productos = ventaService.obtenerProductosMasVendidos(fechaInicio, fechaFin, limite);
        return new ResponseEntity<>(productos, HttpStatus.OK);
    }

    @GetMapping("/ventas-por-metodo")
    public ResponseEntity<List<VentasPorMetodoDTO>> obtenerVentasPorMetodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        List<VentasPorMetodoDTO> ventasPorMetodo = ventaService.obtenerVentasPorMetodo(fechaInicio, fechaFin);
        return new ResponseEntity<>(ventasPorMetodo, HttpStatus.OK);
    }
}
