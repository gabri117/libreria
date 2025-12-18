package com.libreria.libreria.controller;

import com.libreria.libreria.dto.AuditLogDTO;
import com.libreria.libreria.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @Autowired
    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Page<AuditLogDTO>> getHistorialUsuario(
            @PathVariable Integer usuarioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogService.getHistorialUsuario(usuarioId, pageable));
    }

    @GetMapping("/entidad/{entidad}/{entidadId}")
    public ResponseEntity<Page<AuditLogDTO>> getHistorialEntidad(
            @PathVariable String entidad,
            @PathVariable Integer entidadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogService.getHistorialEntidad(entidad, entidadId, pageable));
    }

    @GetMapping("/sesiones")
    public ResponseEntity<Page<AuditLogDTO>> getUltimasSesiones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogService.getUltimasSesiones(pageable));
    }

    @GetMapping
    public ResponseEntity<Page<AuditLogDTO>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogService.getAllAuditLogs(pageable));
    }
}
