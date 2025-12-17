package com.libreria.libreria.dto;

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
public class DetalleVentaDTO {
    // Optional ID for update scenarios
    private Integer detalleId;

    @NotNull
    private Integer productoId;

    private String productoNombre; // Useful for response

    @NotNull
    @Min(1)
    private Integer cantidad;

    @NotNull
    @Min(0)
    private BigDecimal precioUnitario;

    @Min(0)
    private BigDecimal descuento;

    @NotNull
    @Min(0)
    private BigDecimal subtotal;
}
