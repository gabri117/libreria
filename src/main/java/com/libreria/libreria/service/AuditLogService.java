package com.libreria.libreria.service;

import com.libreria.libreria.dto.AuditLogDTO;
import com.libreria.libreria.model.enums.TipoAccion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    /**
     * Registra una acción de auditoría en el sistema
     * 
     * @param usuarioId ID del usuario que realizó la acción
     * @param accion    Tipo de acción realizada
     * @param entidad   Nombre de la entidad afectada (ej: "Producto", "Cliente")
     * @param entidadId ID de la entidad afectada (puede ser null para acciones como
     *                  LOGIN)
     * @param detalles  Detalles adicionales de la acción (JSON o texto descriptivo)
     */
    void logAccion(Integer usuarioId, TipoAccion accion, String entidad, Integer entidadId, String detalles);

    /**
     * Registra una acción de auditoría con dirección IP
     */
    void logAccion(Integer usuarioId, TipoAccion accion, String entidad, Integer entidadId, String detalles,
            String ipAddress);

    /**
     * Obtiene el historial de acciones de un usuario específico
     */
    Page<AuditLogDTO> getHistorialUsuario(Integer usuarioId, Pageable pageable);

    /**
     * Obtiene el historial de cambios de una entidad específica
     */
    Page<AuditLogDTO> getHistorialEntidad(String entidad, Integer entidadId, Pageable pageable);

    /**
     * Obtiene las últimas sesiones de login
     */
    Page<AuditLogDTO> getUltimasSesiones(Pageable pageable);

    /**
     * Obtiene todos los registros de auditoría (paginados)
     */
    Page<AuditLogDTO> getAllAuditLogs(Pageable pageable);
}
