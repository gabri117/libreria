package com.libreria.libreria.repository;

import com.libreria.libreria.model.SesionCaja;
import com.libreria.libreria.model.enums.EstadoSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SesionCajaRepository extends JpaRepository<SesionCaja, Integer> {
    Optional<SesionCaja> findByUsuarioApertura_UsuarioIdAndEstado(Integer usuarioId, EstadoSesion estado);

    Optional<SesionCaja> findTopByUsuarioApertura_UsuarioIdOrderByFechaAperturaDesc(Integer usuarioId);
}
