import axiosClient from '../api/axiosClient';
import type { AuditLogDTO, PageResponse } from '../types';

export const obtenerAuditLogs = async (page = 0, size = 20): Promise<PageResponse<AuditLogDTO>> => {
    const response = await axiosClient.get<PageResponse<AuditLogDTO>>(`/audit?page=${page}&size=${size}`);
    return response.data;
};

export const obtenerSesionesAudit = async (page = 0, size = 20): Promise<PageResponse<AuditLogDTO>> => {
    const response = await axiosClient.get<PageResponse<AuditLogDTO>>(`/audit/sesiones?page=${page}&size=${size}`);
    return response.data;
};

export const obtenerAuditLogsPorUsuario = async (
    usuarioId: number,
    page = 0,
    size = 20
): Promise<PageResponse<AuditLogDTO>> => {
    const response = await axiosClient.get<PageResponse<AuditLogDTO>>(
        `/audit/usuario/${usuarioId}?page=${page}&size=${size}`
    );
    return response.data;
};
