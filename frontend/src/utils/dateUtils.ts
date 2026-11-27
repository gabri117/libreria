/**
 * Utilidades puras de fechas en hora local del equipo (evita desfases UTC de toISOString()).
 */

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Retorna YYYY-MM-DD en zona horaria local. */
export const toLocalDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

/** Retorna YYYY-MM-DDTHH:mm:ss en zona horaria local (compatible con LocalDateTime de Spring). */
export const toLocalIsoDateTime = (date: Date): string => {
    return `${toLocalDateKey(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
};

/** Extrae YYYY-MM-DD desde un string LocalDateTime devuelto por el backend. */
export const extractDateKey = (localDateTime?: string): string => {
    if (!localDateTime) return '';
    return localDateTime.slice(0, 10);
};

/** Parsea YYYY-MM-DD como fecha local (sin desfase de un día por UTC). */
export const parseLocalDateKey = (dateKey: string): Date => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
};
