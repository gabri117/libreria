package com.libreria.libreria.dto;

import com.libreria.libreria.model.enums.NivelPrecio;
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
public class ClienteDTO {
    private Integer clienteId;

    @NotNull
    @Size(max = 150)
    private String nombreCompleto;

    @Size(max = 20)
    private String nit;

    @Size(max = 20)
    private String telefono;

    private String direccion;

    @Size(max = 100)
    private String email;

    @NotNull
    private NivelPrecio nivelPrecioAsignado;

    private Boolean activo;
}
