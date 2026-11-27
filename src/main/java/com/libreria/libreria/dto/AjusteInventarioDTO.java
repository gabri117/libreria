package com.libreria.libreria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AjusteInventarioDTO {
    private Integer ajusteId;

    private Integer usuarioId;
    private String usuarioNombre;

    @NotNull(message = "El producto es requerido")
    private Integer productoId;
    private String productoNombre;
    private String productoSku;

    private LocalDateTime fechaAjuste;

    @NotNull(message = "La cantidad de ajuste es requerida")
    private Integer cantidad;

    @NotBlank(message = "El motivo del ajuste es requerido")
    @Size(max = 200, message = "El motivo no puede exceder 200 caracteres")
    private String motivo;

    private Integer stockResultante;
}
