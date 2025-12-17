package com.libreria.libreria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUsuarioDTO {
    @NotNull
    private Integer rolId;

    @NotBlank
    private String nombreCompleto;

    @NotBlank
    private String username;

    @NotBlank
    private String password;
}
