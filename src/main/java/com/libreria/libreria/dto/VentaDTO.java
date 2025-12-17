package com.libreria.libreria.dto;

import com.libreria.libreria.model.enums.EstadoVenta;
import com.libreria.libreria.model.enums.MetodoPago;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaDTO {
    private Integer ventaId;

    @NotNull
    private Integer sesionId;

    @NotNull
    private Integer usuarioId;
    private String usuarioNombre;

    @NotNull
    private Integer clienteId;
    private String clienteNombre;

    private LocalDateTime fechaVenta;

    private BigDecimal montoTotal;

    @NotNull
    private MetodoPago metodoPago;

    private EstadoVenta estado;

    private String motivoAnulacion;
    private LocalDateTime fechaAnulacion;
    private Integer usuarioAnuloId;

    @NotNull
    private List<DetalleVentaDTO> detalles;
}
