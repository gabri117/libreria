package com.libreria.libreria.repository;

import com.libreria.libreria.model.AjusteInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AjusteInventarioRepository extends JpaRepository<AjusteInventario, Integer> {
    List<AjusteInventario> findAllByOrderByFechaAjusteDesc();
}
