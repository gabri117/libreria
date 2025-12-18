package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.AuditLogDTO;
import com.libreria.libreria.model.AuditLog;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.model.enums.TipoAccion;
import com.libreria.libreria.repository.AuditLogRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public AuditLogServiceImpl(AuditLogRepository auditLogRepository, UsuarioRepository usuarioRepository) {
        this.auditLogRepository = auditLogRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAccion(Integer usuarioId, TipoAccion accion, String entidad, Integer entidadId, String detalles) {
        logAccion(usuarioId, accion, entidad, entidadId, detalles, null);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAccion(Integer usuarioId, TipoAccion accion, String entidad, Integer entidadId, String detalles,
            String ipAddress) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado ID: " + usuarioId));

            AuditLog auditLog = AuditLog.builder()
                    .usuario(usuario)
                    .accion(accion)
                    .entidad(entidad)
                    .entidadId(entidadId)
                    .detalles(detalles)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Log the error but don't fail the main transaction
            System.err.println("Error al registrar auditoría: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getHistorialUsuario(Integer usuarioId, Pageable pageable) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado ID: " + usuarioId));

        return auditLogRepository.findByUsuarioOrderByFechaAccionDesc(usuario, pageable)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getHistorialEntidad(String entidad, Integer entidadId, Pageable pageable) {
        return auditLogRepository.findByEntidadAndEntidadIdOrderByFechaAccionDesc(entidad, entidadId, pageable)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getUltimasSesiones(Pageable pageable) {
        return auditLogRepository.findByAccionOrderByFechaAccionDesc(TipoAccion.LOGIN, pageable)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByFechaAccionDesc(pageable)
                .map(this::convertToDTO);
    }

    private AuditLogDTO convertToDTO(AuditLog auditLog) {
        return AuditLogDTO.builder()
                .auditId(auditLog.getAuditId())
                .usuarioId(auditLog.getUsuario().getUsuarioId())
                .usuarioNombre(auditLog.getUsuario().getNombreCompleto())
                .accion(auditLog.getAccion())
                .entidad(auditLog.getEntidad())
                .entidadId(auditLog.getEntidadId())
                .detalles(auditLog.getDetalles())
                .fechaAccion(auditLog.getFechaAccion())
                .ipAddress(auditLog.getIpAddress())
                .build();
    }
}
