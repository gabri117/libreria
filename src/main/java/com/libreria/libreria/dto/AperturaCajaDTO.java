package com.libreria.libreria.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AperturaCajaDTO {
    @NotNull
    private Integer usuarioId;

    @NotNull
    @PositiveOrZero
    private BigDecimal montoInicial;
}
