package com.libreria.libreria.repository;

import com.libreria.libreria.model.Venta;
import com.libreria.libreria.model.enums.EstadoVenta;
import com.libreria.libreria.model.enums.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    List<Venta> findBySesion_SesionIdAndEstadoAndMetodoPago(Integer sesionId, EstadoVenta estado,
            MetodoPago metodoPago);
}
