import { useState, useEffect } from 'react';
import { Users, Plus, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
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
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
                                <Users size={24} />
                            </div>
                            Gestión de Clientes
                        </h1>
                        <p className="text-gray-500 mt-1 ml-14">Administra tu cartera de clientes y niveles de precio.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={cargarClientes}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200"
                            title="Recargar"
                        >
                            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => { setSelectedCliente(null); setIsModalOpen(true); }}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-gray-200 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Plus size={20} /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o NIT..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
                        <RefreshCw className="animate-spin mx-auto text-indigo-500 mb-4" size={32} />
                        <p className="text-gray-500">Cargando clientes...</p>
                    </div>
                ) : (
                    <ClientTable
                        clientes={filteredClientes}
                        onEdit={(c) => { setSelectedCliente(c); setIsModalOpen(true); }}
                        onDelete={handleEliminar}
                    />
                )}
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
