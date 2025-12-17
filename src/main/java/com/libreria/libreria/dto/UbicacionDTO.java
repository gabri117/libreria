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
public class UbicacionDTO {
    private Integer ubicacionId;

    @NotNull
    @Size(max = 50)
    private String nombreCorto;

    @NotNull
    private String descripcion;
}
