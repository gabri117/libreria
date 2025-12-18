import { useEffect, useState } from 'react';
import type { Cliente } from '../types';
import { obtenerClientes } from '../services/clienteService';
import { useCart } from '../context/CartContext';
import { Users } from 'lucide-react';

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
        <div className="glass-card p-5 rounded-2xl mb-6 relative overflow-hidden group border-white/5">
            <div className="flex items-center gap-2 mb-3 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] group-hover:text-brand-primary-400 transition-colors">
                <Users size={14} strokeWidth={2.5} />
                <label htmlFor="client-select">Cliente Asignado</label>
            </div>

            <div className="relative group/select">
                <select
                    id="client-select"
                    className="
                        w-full appearance-none 
                        bg-white/5 border border-white/10
                        text-white py-3 px-4 pr-10 rounded-xl leading-tight 
                        focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10
                        transition-all cursor-pointer text-sm font-bold
                    "
                    value={clienteSeleccionado?.clienteId || ""}
                    onChange={(e) => {
                        const id = Number(e.target.value);
                        const cliente = clientes.find(c => c.clienteId === id) || null;
                        seleccionarCliente(cliente);
                    }}
                    disabled={loading}
                >
                    <option value="" className="bg-slate-900">-- Consumidor Final (C/F) --</option>
                    {clientes.map(cliente => (
                        <option key={cliente.clienteId} value={cliente.clienteId} className="bg-slate-900">
                            {cliente.nombreCompleto} — {cliente.nivelPrecioAsignado === 'Mayorista' ? '⭐' : '🛒'} {cliente.nivelPrecioAsignado}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 group-focus-within/select:text-brand-primary-400 transition-colors">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>

            {clienteSeleccionado && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit animate-slide-up border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>
                        Tarifa: <b className="text-white">{clienteSeleccionado.nivelPrecioAsignado}</b>
                    </span>
                </div>
            )}

            {/* Subtle internal glow */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/5 blur-xl rounded-full"></div>
        </div>
    );
};
