package com.libreria.libreria.service;

import com.libreria.libreria.dto.AperturaCajaDTO;
import com.libreria.libreria.dto.CierreCajaDTO;
import com.libreria.libreria.dto.SesionCajaDTO;

public interface SesionCajaService {
    SesionCajaDTO obtenerSesionActiva(Integer usuarioId);

    SesionCajaDTO abrirSesion(AperturaCajaDTO dto);

    SesionCajaDTO cerrarSesion(Integer sesionId, CierreCajaDTO dto);
}
