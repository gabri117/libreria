package com.libreria.libreria.model;

import com.libreria.libreria.model.enums.TipoAccion;
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
@Table(name = "Audit_Logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Integer auditId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAccion accion;

    @NotNull
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String entidad;

    @Column(name = "entidad_id")
    private Integer entidadId;

    @Column(columnDefinition = "TEXT")
    private String detalles;

    @NotNull
    @Column(name = "fecha_accion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaAccion = LocalDateTime.now();

    @Size(max = 50)
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}
