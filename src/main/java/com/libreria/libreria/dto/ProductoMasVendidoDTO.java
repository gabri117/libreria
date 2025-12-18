package com.libreria.libreria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoMasVendidoDTO {
    private Integer productoId;
    private String nombreProducto;
    private Integer cantidadVendida;
    private BigDecimal montoTotal;
}
