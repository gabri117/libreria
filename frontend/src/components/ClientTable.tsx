import { Edit, Trash2 } from 'lucide-react';
import type { Cliente } from '../types';

interface ClientTableProps {
    clientes: Cliente[];
    onEdit: (cliente: Cliente) => void;
    onDelete: (id: number) => void;
}

export const ClientTable = ({ clientes, onEdit, onDelete }: ClientTableProps) => {
    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-900 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Nombre Completo</th>
                            <th className="px-6 py-4">NIT</th>
                            <th className="px-6 py-4">Teléfono</th>
                            <th className="px-6 py-4 text-center">Nivel Precio</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clientes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    No hay clientes registrados
                                </td>
                            </tr>
                        ) : (
                            clientes.map((cliente) => (
                                <tr key={cliente.clienteId} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {cliente.nombreCompleto}
                                        <div className="text-xs text-gray-400 font-normal">{cliente.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{cliente.nit || 'C/F'}</td>
                                    <td className="px-6 py-4">{cliente.telefono || '-'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`
                                            inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                            ${cliente.nivelPrecioAsignado === 'Mayorista' ? 'bg-purple-100 text-purple-700' :
                                                cliente.nivelPrecioAsignado === 'Costo' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'}
                                        `}>
                                            {cliente.nivelPrecioAsignado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(cliente)}
                                                className="rounded p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(cliente.clienteId)}
                                                className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
