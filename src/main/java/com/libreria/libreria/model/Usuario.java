package com.libreria.libreria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usuario_id")
    private Integer usuarioId;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER) // EAGER might be better for Role usually
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @NotNull
    @Size(max = 150)
    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @NotNull
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotNull
    @Size(max = 255)
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Builder.Default
    private Boolean activo = true;
}
