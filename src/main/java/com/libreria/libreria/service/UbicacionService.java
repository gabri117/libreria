package com.libreria.libreria.service;

import com.libreria.libreria.dto.UbicacionDTO;
import java.util.List;

public interface UbicacionService {
    List<UbicacionDTO> listarTodas();

    UbicacionDTO obtenerPorId(Integer id);

    UbicacionDTO crear(UbicacionDTO dto);

    UbicacionDTO actualizar(Integer id, UbicacionDTO dto);

    void eliminar(Integer id);
}
