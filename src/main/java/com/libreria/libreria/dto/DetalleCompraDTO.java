package com.libreria.libreria.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCompraDTO {
    private Integer detalleCompraId;

    @NotNull(message = "El producto es requerido")
    private Integer productoId;
    private String productoNombre;
    private String productoSku;

    @NotNull(message = "La cantidad es requerida")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    @NotNull(message = "El precio de costo es requerido")
    @DecimalMin(value = "0.00", message = "El precio de costo no puede ser negativo")
    private BigDecimal precioCostoCompra;

    private BigDecimal subtotal;
}
