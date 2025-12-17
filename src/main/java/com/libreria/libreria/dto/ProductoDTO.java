package com.libreria.libreria.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoDTO {
    private Integer productoId;

    @NotNull
    private Integer categoriaId;
    private String categoriaNombre;

    @NotNull
    private Integer ubicacionId;
    private String ubicacionNombre;

    @NotNull
    @Size(max = 150)
    private String nombre;

    private String descripcion;

    @Size(max = 100)
    private String sku;

    @NotNull
    @Min(0)
    private BigDecimal precioVenta;

    @NotNull
    @Min(0)
    private BigDecimal precioMayorista;

    @Min(0)
    private BigDecimal precioCosto;

    @NotNull
    private Integer cantidadStock;

    private Boolean activo;
}
