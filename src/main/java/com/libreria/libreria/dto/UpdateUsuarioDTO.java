package com.libreria.libreria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUsuarioDTO {
    @NotBlank(message = "El nombre completo es requerido")
    private String nombreCompleto;

    @NotNull(message = "El rol es requerido")
    private Integer rolId;

    private String password; // Opcional: solo se actualiza si se envía no vacío

    private Boolean activo;
}
