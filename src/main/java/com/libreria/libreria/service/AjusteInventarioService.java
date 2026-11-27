package com.libreria.libreria.service;

import com.libreria.libreria.dto.AjusteInventarioDTO;

import java.util.List;

public interface AjusteInventarioService {
    AjusteInventarioDTO registrarAjuste(AjusteInventarioDTO dto, Integer usuarioId);

    List<AjusteInventarioDTO> listarAjustes();
}
