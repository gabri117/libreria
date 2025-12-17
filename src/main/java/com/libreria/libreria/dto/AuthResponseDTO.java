package com.libreria.libreria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDTO {
    private Integer usuarioId;
    private String nombreCompleto;
    private String username;
    private String rol;
    private String token; // For now a simple placeholder or JWT later
}
