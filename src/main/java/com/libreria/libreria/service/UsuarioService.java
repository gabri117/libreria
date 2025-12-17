package com.libreria.libreria.service;

import com.libreria.libreria.dto.LoginRequestDTO;
import com.libreria.libreria.dto.UsuarioCreateDTO;
import com.libreria.libreria.dto.UsuarioDTO;

public interface UsuarioService {
    UsuarioDTO registrarUsuario(UsuarioCreateDTO usuarioCreateDTO);

    UsuarioDTO login(LoginRequestDTO loginRequestDTO);
}
