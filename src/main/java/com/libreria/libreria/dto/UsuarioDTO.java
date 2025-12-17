package com.libreria.libreria.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    private Integer usuarioId;

    @NotNull
    private Integer rolId;

    // Optional: include role name for display purposes
    private String rolNombre;

    @NotNull
    @Size(max = 150)
    private String nombreCompleto;

    @NotNull
    @Size(max = 50)
    private String username;

    private Boolean activo;

    // NO password_hash here
}
