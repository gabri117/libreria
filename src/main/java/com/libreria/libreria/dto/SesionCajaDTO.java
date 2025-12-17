package com.libreria.libreria.dto;

import com.libreria.libreria.model.enums.EstadoSesion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionCajaDTO {
    private Integer sesionId;
    private Integer usuarioAperturaId;
    private String usuarioAperturaNombre;
    private LocalDateTime fechaApertura;
    private BigDecimal montoInicial;
    private Integer usuarioCierreId;
    private String usuarioCierreNombre;
    private LocalDateTime fechaCierre;
    private BigDecimal montoFinalEsperado;
    private BigDecimal montoFinalContado;
    private BigDecimal diferencia;
    private EstadoSesion estado;
}
