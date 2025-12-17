package com.libreria.libreria.repository;

import com.libreria.libreria.model.SesionCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SesionCajaRepository extends JpaRepository<SesionCaja, Integer> {
}
