package com.libreria.libreria.model;

import com.libreria.libreria.model.enums.EstadoSesion;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Sesiones_Caja")
public class SesionCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sesion_id")
    private Integer sesionId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_apertura_id", nullable = false)
    private Usuario usuarioApertura;

    @NotNull
    @Column(name = "fecha_apertura", nullable = false)
    @Builder.Default
    private LocalDateTime fechaApertura = LocalDateTime.now();

    @NotNull
    @Column(name = "monto_inicial", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoInicial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_cierre_id")
    private Usuario usuarioCierre;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "monto_final_esperado", precision = 10, scale = 2)
    private BigDecimal montoFinalEsperado;

    @Column(name = "monto_final_contado", precision = 10, scale = 2)
    private BigDecimal montoFinalContado;

    @Column(precision = 10, scale = 2)
    private BigDecimal diferencia;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoSesion estado = EstadoSesion.Abierta;
}
