import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ClientTable } from '../components/ClientTable';
import ClientModal from '../components/ClientModal';
import { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente } from '../services/clienteService';
import type { Cliente, ClienteFormData } from '../types';

export default function ClientsPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

    useEffect(() => {
        cargarClientes();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredClientes(clientes);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredClientes(clientes.filter(c =>
                c.nombreCompleto.toLowerCase().includes(term) ||
                (c.nit && c.nit.toLowerCase().includes(term))
            ));
        }
    }, [searchTerm, clientes]);

    const cargarClientes = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerClientes();
            setClientes(data);
            setFilteredClientes(data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando clientes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuardar = async (formData: ClienteFormData) => {
        try {
            if (selectedCliente) {
                await actualizarCliente(selectedCliente.clienteId, formData);
                toast.success('Cliente actualizado');
            } else {
                await crearCliente(formData);
                toast.success('Cliente creado');
            }
            await cargarClientes();
            setIsModalOpen(false);
            setSelectedCliente(null);
        } catch (error) {
            console.error(error);
            toast.error('Error guardando cliente');
        }
    };

    const handleEliminar = async (id: number) => {
        if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
        try {
            await eliminarCliente(id);
            toast.success('Cliente eliminado');
            cargarClientes();
        } catch (error) {
            console.error(error);
            toast.error('Error eliminando cliente');
        }
    };

    return (
        <div className="min-h-screen font-sans">
            <div className="max-w-full mx-auto p-4 sm:p-8">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Gestión de Clientes</h1>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-11">Administración de cartera y tarifas</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={cargarClientes}
                            className="p-3 glass-card text-gray-400 hover:text-brand-primary-400 rounded-2xl transition-all border-white/5 hover:border-brand-primary-500/30 active:scale-90"
                            title="Recargar"
                        >
                            <RefreshCw size={20} strokeWidth={2.5} className={isLoading ? 'animate-spin text-brand-primary-500' : ''} />
                        </button>
                        <button
                            onClick={() => { setSelectedCliente(null); setIsModalOpen(true); }}
                            className="bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-brand-primary-600/20 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs"
                        >
                            <Plus size={20} strokeWidth={3} /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="glass-panel p-6 border-white/5 rounded-3xl mb-10 flex gap-4 animate-slide-up">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, NIT o ID de cliente..."
                            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Area */}
                <div className="animate-fade-in delay-100">
                    {isLoading ? (
                        <div className="text-center py-32 glass-panel rounded-3xl border-dashed border-white/5">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-brand-primary-500/20 blur-2xl rounded-full"></div>
                                <RefreshCw className="animate-spin text-brand-primary-500 relative z-10" size={48} strokeWidth={2.5} />
                            </div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Consultando base de datos...</p>
                        </div>
                    ) : (
                        <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl shadow-black/40">
                            <ClientTable
                                clientes={filteredClientes}
                                onEdit={(c) => { setSelectedCliente(c); setIsModalOpen(true); }}
                                onDelete={handleEliminar}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedCliente(null); }}
                onSave={handleGuardar}
                cliente={selectedCliente}
            />
        </div>
    );
}
