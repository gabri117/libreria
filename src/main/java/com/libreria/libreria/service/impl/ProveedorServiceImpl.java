package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.ProveedorDTO;
import com.libreria.libreria.model.Proveedor;
import com.libreria.libreria.repository.ProveedorRepository;
import com.libreria.libreria.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository proveedorRepository;

    @Autowired
    public ProveedorServiceImpl(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    @Override
    public List<ProveedorDTO> listarTodos() {
        return proveedorRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProveedorDTO obtenerPorId(Integer id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + id));
        return mapToDTO(proveedor);
    }

    @Override
    @Transactional
    public ProveedorDTO crear(ProveedorDTO dto) {
        Proveedor proveedor = Proveedor.builder()
                .nombreEmpresa(dto.getNombreEmpresa())
                .nombreContacto(dto.getNombreContacto())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .nitProveedor(dto.getNitProveedor())
                .build();
        return mapToDTO(proveedorRepository.save(proveedor));
    }

    @Override
    @Transactional
    public ProveedorDTO actualizar(Integer id, ProveedorDTO dto) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + id));

        proveedor.setNombreEmpresa(dto.getNombreEmpresa());
        proveedor.setNombreContacto(dto.getNombreContacto());
        proveedor.setTelefono(dto.getTelefono());
        proveedor.setEmail(dto.getEmail());
        proveedor.setNitProveedor(dto.getNitProveedor());

        return mapToDTO(proveedorRepository.save(proveedor));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!proveedorRepository.existsById(id)) {
            throw new RuntimeException("Proveedor no encontrado con ID: " + id);
        }
        proveedorRepository.deleteById(id);
    }

    private ProveedorDTO mapToDTO(Proveedor proveedor) {
        return ProveedorDTO.builder()
                .proveedorId(proveedor.getProveedorId())
                .nombreEmpresa(proveedor.getNombreEmpresa())
                .nombreContacto(proveedor.getNombreContacto())
                .telefono(proveedor.getTelefono())
                .email(proveedor.getEmail())
                .nitProveedor(proveedor.getNitProveedor())
                .build();
    }
}
