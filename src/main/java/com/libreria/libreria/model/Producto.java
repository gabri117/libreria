package com.libreria.libreria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "producto_id")
    private Integer productoId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ubicacion_id", nullable = false)
    private Ubicacion ubicacion;

    @NotNull
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Size(max = 100)
    @Column(unique = true, length = 100)
    private String sku;

    @NotNull
    @Min(0)
    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @NotNull
    @Min(0)
    @Column(name = "precio_mayorista", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal precioMayorista = BigDecimal.ZERO;

    @Min(0)
    @Column(name = "precio_costo", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal precioCosto = BigDecimal.ZERO;

    @NotNull
    @Column(name = "cantidad_stock", nullable = false)
    @Builder.Default
    private Integer cantidadStock = 0;

    @Builder.Default
    private Boolean activo = true;
}
