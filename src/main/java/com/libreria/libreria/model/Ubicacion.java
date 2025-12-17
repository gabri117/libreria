package com.libreria.libreria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Ubicaciones")
public class Ubicacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ubicacion_id")
    private Integer ubicacionId;

    @NotNull
    @Size(max = 50)
    @Column(name = "nombre_corto", nullable = false, unique = true, length = 50)
    private String nombreCorto;

    @NotNull
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @OneToMany(mappedBy = "ubicacion")
    @ToString.Exclude
    @Builder.Default
    private List<Producto> productos = new ArrayList<>();
}
