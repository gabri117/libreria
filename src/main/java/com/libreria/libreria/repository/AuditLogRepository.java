package com.libreria.libreria.repository;

import com.libreria.libreria.model.AuditLog;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.model.enums.TipoAccion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {

    Page<AuditLog> findByUsuarioOrderByFechaAccionDesc(Usuario usuario, Pageable pageable);

    Page<AuditLog> findByEntidadAndEntidadIdOrderByFechaAccionDesc(
            String entidad,
            Integer entidadId,
            Pageable pageable);

    Page<AuditLog> findByAccionOrderByFechaAccionDesc(TipoAccion accion, Pageable pageable);

    Page<AuditLog> findAllByOrderByFechaAccionDesc(Pageable pageable);
}
