package com.libreria.libreria.model;

import com.libreria.libreria.model.enums.NivelPrecio;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cliente_id")
    private Integer clienteId;

    @NotNull
    @Size(max = 150)
    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Size(max = 20)
    @Column(length = 20)
    @Builder.Default
    private String nit = "CF";

    @Size(max = 20)
    @Column(length = 20)
    private String telefono;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Size(max = 100)
    @Column(length = 100)
    private String email;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_precio_asignado", nullable = false)
    @Builder.Default
    private NivelPrecio nivelPrecioAsignado = NivelPrecio.Publico;

    @Builder.Default
    private Boolean activo = true;
}
