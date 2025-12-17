import { useEffect, useState } from 'react';
import type { Cliente } from '../types';
import { obtenerClientes } from '../services/clienteService';
import { useCart } from '../context/CartContext';
import { Users, Check } from 'lucide-react';

export const ClientSelector = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const { clienteSeleccionado, seleccionarCliente } = useCart();

    useEffect(() => {
        obtenerClientes()
            .then(setClientes)
            .catch(err => console.error("Error cargando clientes", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
            <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold text-sm">
                <Users size={16} />
                <label htmlFor="client-select">Cliente Asignado</label>
            </div>

            <div className="relative">
                <select
                    id="client-select"
                    className="
                        w-full appearance-none bg-white border border-gray-200 
                        text-gray-700 py-2.5 px-4 pr-8 rounded-lg leading-tight 
                        focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                        transition-all cursor-pointer text-sm
                    "
                    value={clienteSeleccionado?.clienteId || ""}
                    onChange={(e) => {
                        const id = Number(e.target.value);
                        const cliente = clientes.find(c => c.clienteId === id) || null;
                        seleccionarCliente(cliente);
                    }}
                    disabled={loading}
                >
                    <option value="">-- Cliente Público (Precio Base) --</option>
                    {clientes.map(cliente => (
                        <option key={cliente.clienteId} value={cliente.clienteId}>
                            {cliente.nombreCompleto} — {cliente.nivelPrecioAsignado === 'Mayorista' ? '⭐ Mayorista' : 'Público'}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>

            {clienteSeleccionado && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded w-fit animate-fade-in">
                    <Check size={12} strokeWidth={3} />
                    <span>
                        Precio activo: <b>{clienteSeleccionado.nivelPrecioAsignado}</b>
                    </span>
                </div>
            )}
        </div>
    );
};
