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
public class UsuarioCreateDTO {
    @NotNull
    private Integer rolId;

    @NotNull
    @Size(max = 150)
    private String nombreCompleto;

    @NotNull
    @Size(max = 50)
    private String username;

    @NotNull
    @Size(min = 6, max = 50)
    private String password;
}
