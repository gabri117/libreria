package com.libreria.libreria.service;

import com.libreria.libreria.dto.EstadisticasVentasDTO;
import com.libreria.libreria.dto.ProductoMasVendidoDTO;
import com.libreria.libreria.dto.VentaDTO;
import com.libreria.libreria.dto.VentasPorMetodoDTO;
import com.libreria.libreria.model.enums.EstadoVenta;
import com.libreria.libreria.model.enums.MetodoPago;

import java.time.LocalDateTime;
import java.util.List;

public interface VentaService {
        VentaDTO crearVenta(VentaDTO ventaDTO);

        List<VentaDTO> listarVentas();

        VentaDTO obtenerVentaPorId(Integer ventaId);

        List<VentaDTO> filtrarVentas(LocalDateTime fechaInicio, LocalDateTime fechaFin,
                        Integer clienteId, MetodoPago metodoPago, EstadoVenta estado);

        VentaDTO anularVenta(Integer ventaId, Integer usuarioId, String motivo);

        EstadisticasVentasDTO obtenerEstadisticas(LocalDateTime fechaInicio, LocalDateTime fechaFin);

        List<ProductoMasVendidoDTO> obtenerProductosMasVendidos(LocalDateTime fechaInicio, LocalDateTime fechaFin,
                        Integer limite);

        List<VentasPorMetodoDTO> obtenerVentasPorMetodo(LocalDateTime fechaInicio, LocalDateTime fechaFin);

        byte[] generarReportePdf(Integer ventaId);
}
