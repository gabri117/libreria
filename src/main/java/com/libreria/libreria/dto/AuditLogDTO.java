package com.libreria.libreria.dto;

import com.libreria.libreria.model.enums.TipoAccion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDTO {
    private Integer auditId;
    private Integer usuarioId;
    private String usuarioNombre;
    private TipoAccion accion;
    private String entidad;
    private Integer entidadId;
    private String detalles;
    private LocalDateTime fechaAccion;
    private String ipAddress;
}
