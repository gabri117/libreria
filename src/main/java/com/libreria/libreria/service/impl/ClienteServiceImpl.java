package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.ClienteDTO;
import com.libreria.libreria.model.Cliente;
import com.libreria.libreria.model.enums.TipoAccion;
import com.libreria.libreria.repository.ClienteRepository;
import com.libreria.libreria.service.AuditLogService;
import com.libreria.libreria.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final AuditLogService auditLogService;

    @Autowired
    public ClienteServiceImpl(ClienteRepository clienteRepository, AuditLogService auditLogService) {
        this.clienteRepository = clienteRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteDTO> findAll() {
        return clienteRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActivo()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ClienteDTO> findById(Integer id) {
        return clienteRepository.findById(id)
                .filter(c -> Boolean.TRUE.equals(c.getActivo()))
                .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public ClienteDTO save(ClienteDTO clienteDTO) {
        Cliente cliente = mapToEntity(clienteDTO);
        cliente.setActivo(true); // Default active on create
        Cliente savedCliente = clienteRepository.save(cliente);

        // Audit log
        try {
            auditLogService.logAccion(1, TipoAccion.CREATE, "Cliente", savedCliente.getClienteId(),
                    "Cliente creado: " + savedCliente.getNombreCompleto());
        } catch (Exception e) {
            // Continue even if audit fails
        }

        return mapToDTO(savedCliente);
    }

    @Override
    @Transactional
    public ClienteDTO update(Integer id, ClienteDTO clienteDTO) {
        return clienteRepository.findById(id).map(existingCliente -> {
            existingCliente.setNombreCompleto(clienteDTO.getNombreCompleto());
            existingCliente.setNit(clienteDTO.getNit());
            existingCliente.setTelefono(clienteDTO.getTelefono());
            existingCliente.setDireccion(clienteDTO.getDireccion());
            existingCliente.setEmail(clienteDTO.getEmail());
            existingCliente.setNivelPrecioAsignado(clienteDTO.getNivelPrecioAsignado());
            // We don't update 'activo' here usually, or we can if passed
            if (clienteDTO.getActivo() != null) {
                existingCliente.setActivo(clienteDTO.getActivo());
            }

            Cliente updated = clienteRepository.save(existingCliente);

            // Audit log
            try {
                String detalles = String.format("Cliente actualizado: %s (ID: %d)", updated.getNombreCompleto(),
                        updated.getClienteId());
                auditLogService.logAccion(1, TipoAccion.UPDATE, "Cliente", updated.getClienteId(), detalles);
            } catch (Exception e) {
                // Continue even if audit fails
            }

            return mapToDTO(updated);
        }).orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + id));
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        clienteRepository.findById(id).ifPresent(cliente -> {
            cliente.setActivo(false);
            clienteRepository.save(cliente);

            // Audit log
            try {
                String detalles = String.format("Cliente eliminado (soft delete): %s (ID: %d)",
                        cliente.getNombreCompleto(), cliente.getClienteId());
                auditLogService.logAccion(1, TipoAccion.DELETE, "Cliente", cliente.getClienteId(), detalles);
            } catch (Exception e) {
                // Continue even if audit fails
            }
        });
    }

    // Mapping Helpers
    private ClienteDTO mapToDTO(Cliente cliente) {
        return ClienteDTO.builder()
                .clienteId(cliente.getClienteId())
                .nombreCompleto(cliente.getNombreCompleto())
                .nit(cliente.getNit())
                .telefono(cliente.getTelefono())
                .direccion(cliente.getDireccion())
                .email(cliente.getEmail())
                .nivelPrecioAsignado(cliente.getNivelPrecioAsignado())
                .activo(cliente.getActivo())
                .build();
    }

    private Cliente mapToEntity(ClienteDTO dto) {
        return Cliente.builder()
                .clienteId(dto.getClienteId())
                .nombreCompleto(dto.getNombreCompleto())
                .nit(dto.getNit())
                .telefono(dto.getTelefono())
                .direccion(dto.getDireccion())
                .email(dto.getEmail())
                .nivelPrecioAsignado(dto.getNivelPrecioAsignado())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();
    }
}
