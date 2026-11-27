/**
 * Utilidad pura para exportar arreglos tabulares a CSV compatible con Microsoft Excel (UTF-8 BOM).
 * Incluye escape RFC 4180 y protección contra inyección de fórmulas en celdas de texto.
 */

export interface CsvColumn<T> {
    header: string;
    accessor: (row: T) => string | number | boolean | null | undefined;
}

const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

const escapeCsvCell = (rawValue: string | number | boolean | null | undefined): string => {
    if (rawValue === null || rawValue === undefined) return '';

    if (typeof rawValue === 'number') {
        return Number.isFinite(rawValue) ? String(rawValue) : '';
    }

    let str = String(rawValue);

    // Prevenir CSV Formula Injection en cadenas de texto que comienzan con operadores de Excel
    if (typeof rawValue === 'string' && str.length > 0 && FORMULA_PREFIXES.includes(str[0])) {
        str = `'${str}`;
    }

    const needsQuotes = /[",\n\r]/.test(str);
    if (needsQuotes) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const exportToCsv = <T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void => {
    const headerLine = columns.map(col => escapeCsvCell(col.header)).join(',');
    const dataLines = rows.map(row =>
        columns.map(col => escapeCsvCell(col.accessor(row))).join(',')
    );

    // UTF-8 BOM para que Excel en Windows reconozca tildes y ñ automáticamente
    const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
