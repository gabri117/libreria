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
public class ProveedorDTO {
    private Integer proveedorId;

    @NotNull
    @Size(max = 150)
    private String nombreEmpresa;

    @Size(max = 100)
    private String nombreContacto;

    @Size(max = 20)
    private String telefono;

    @Size(max = 100)
    private String email;

    @Size(max = 30)
    private String nitProveedor;
}
