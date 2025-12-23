package com.libreria.libreria.repository;

import com.libreria.libreria.model.Venta;
import com.libreria.libreria.model.enums.EstadoVenta;
import com.libreria.libreria.model.enums.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
        List<Venta> findBySesion_SesionIdAndEstadoAndMetodoPago(Integer sesionId, EstadoVenta estado,
                        MetodoPago metodoPago);

        List<Venta> findAllByOrderByFechaVentaDesc();

        // Filter by date range
        List<Venta> findByFechaVentaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

        // Filter by client
        List<Venta> findByCliente_ClienteId(Integer clienteId);

        // Filter by payment method
        List<Venta> findByMetodoPago(MetodoPago metodoPago);

        // Filter by state
        List<Venta> findByEstado(EstadoVenta estado);

        // Complex filter query with optional parameters
        @Query("SELECT v FROM Venta v WHERE " +
                        "(:fechaInicio IS NULL OR v.fechaVenta >= :fechaInicio) AND " +
                        "(:fechaFin IS NULL OR v.fechaVenta <= :fechaFin) AND " +
                        "(:clienteId IS NULL OR v.cliente.clienteId = :clienteId) AND " +
                        "(:metodoPago IS NULL OR v.metodoPago = :metodoPago) AND " +
                        "(:estado IS NULL OR v.estado = :estado) " +
                        "ORDER BY v.fechaVenta DESC")
        List<Venta> filtrarVentas(
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin,
                        @Param("clienteId") Integer clienteId,
                        @Param("metodoPago") MetodoPago metodoPago,
                        @Param("estado") EstadoVenta estado);

        // Statistics queries
        @Query("SELECT COALESCE(SUM(v.montoTotal), 0) FROM Venta v WHERE " +
                        "v.fechaVenta >= :fechaInicio AND v.fechaVenta <= :fechaFin AND v.estado = 'Completada'")
        BigDecimal calcularTotalVentas(
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        @Query("SELECT COUNT(v) FROM Venta v WHERE " +
                        "v.fechaVenta >= :fechaInicio AND v.fechaVenta <= :fechaFin AND v.estado = 'Completada'")
        Long contarTransacciones(
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        // Top selling products
        @Query("SELECT d.producto.productoId as productoId, d.producto.nombre as nombreProducto, " +
                        "SUM(d.cantidad) as cantidadVendida, SUM(d.subtotal) as montoTotal " +
                        "FROM DetalleVenta d JOIN d.venta v " +
                        "WHERE v.fechaVenta >= :fechaInicio AND v.fechaVenta <= :fechaFin AND v.estado = 'Completada' "
                        +
                        "GROUP BY d.producto.productoId, d.producto.nombre " +
                        "ORDER BY cantidadVendida DESC")
        List<Object[]> obtenerProductosMasVendidos(
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        // Sales by payment method
        @Query("SELECT v.metodoPago as metodoPago, COUNT(v) as numeroVentas, SUM(v.montoTotal) as montoTotal " +
                        "FROM Venta v " +
                        "WHERE v.fechaVenta >= :fechaInicio AND v.fechaVenta <= :fechaFin AND v.estado = 'Completada' "
                        +
                        "GROUP BY v.metodoPago")
        List<Object[]> obtenerVentasPorMetodo(
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);
}
