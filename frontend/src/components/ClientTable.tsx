import { Edit, Trash2, Users } from 'lucide-react';
import type { Cliente } from '../types';

interface ClientTableProps {
    clientes: Cliente[];
    onEdit: (cliente: Cliente) => void;
    onDelete: (id: number) => void;
}

export const ClientTable = ({ clientes, onEdit, onDelete }: ClientTableProps) => {
    return (
        <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm text-gray-400 border-collapse">
                <thead>
                    <tr className="bg-white/5 text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] border-b border-white/5">
                        <th className="px-8 py-6">Cliente / Identificación</th>
                        <th className="px-8 py-6">Contacto</th>
                        <th className="px-8 py-6 text-center">Nivel de Tarifa</th>
                        <th className="px-8 py-6 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {clientes.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center opacity-20">
                                    <Users size={64} strokeWidth={1} className="mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest">No hay registros</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        clientes.map((cliente) => (
                            <tr key={cliente.clienteId} className="hover:bg-white/5 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-white text-base group-hover:text-brand-primary-400 transition-colors">
                                            {cliente.nombreCompleto}
                                        </span>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                                            NIT: {cliente.nit || 'Consumidor Final'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-300 font-bold">{cliente.telefono || 'Sin teléfono'}</span>
                                        <span className="text-xs text-gray-500">{cliente.email || 'Sin correo'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`
                                        inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest
                                        ${cliente.nivelPrecioAsignado === 'Mayorista' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            cliente.nivelPrecioAsignado === 'Costo' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                'bg-brand-primary-500/10 text-brand-primary-400 border border-brand-primary-500/20'}
                                    `}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${cliente.nivelPrecioAsignado === 'Mayorista' ? 'bg-purple-500' : cliente.nivelPrecioAsignado === 'Costo' ? 'bg-orange-500' : 'bg-brand-primary-500'}`}></div>
                                        {cliente.nivelPrecioAsignado}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                        <button
                                            onClick={() => onEdit(cliente)}
                                            className="glass-card p-3 text-gray-400 hover:text-brand-primary-400 rounded-xl transition-all border-white/5 hover:border-brand-primary-500/30"
                                            title="Editar"
                                        >
                                            <Edit size={16} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(cliente.clienteId)}
                                            className="glass-card p-3 text-gray-400 hover:text-red-400 rounded-xl transition-all border-white/5 hover:border-red-500/30"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
