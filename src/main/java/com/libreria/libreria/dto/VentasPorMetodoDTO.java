package com.libreria.libreria.dto;

import com.libreria.libreria.model.enums.MetodoPago;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentasPorMetodoDTO {
    private MetodoPago metodoPago;
    private Integer numeroVentas;
    private BigDecimal montoTotal;
}
