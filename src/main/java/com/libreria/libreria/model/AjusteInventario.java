package com.libreria.libreria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Ajustes_Inventario")
public class AjusteInventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ajuste_id")
    private Integer ajusteId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "fecha_ajuste")
    @Builder.Default
    private LocalDateTime fechaAjuste = LocalDateTime.now();

    @NotNull
    @Column(nullable = false)
    private Integer cantidad;

    @NotNull
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String motivo;
}
