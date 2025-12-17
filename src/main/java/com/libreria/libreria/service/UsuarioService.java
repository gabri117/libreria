package com.libreria.libreria.service;

import com.libreria.libreria.dto.CreateUsuarioDTO;
import com.libreria.libreria.dto.LoginDTO;
import com.libreria.libreria.dto.UsuarioDTO;
import com.libreria.libreria.model.Usuario;
import java.util.List;
import java.util.Optional;

public interface UsuarioService {
    List<UsuarioDTO> obtenerUsuarios();

    UsuarioDTO crearUsuario(CreateUsuarioDTO dto);

    Optional<Usuario> login(LoginDTO loginDTO);

    UsuarioDTO obtenerUsuarioPorId(Integer id);
}
