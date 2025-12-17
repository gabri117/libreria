import { useState, useEffect } from 'react';
import { X, Save, Key, User, Phone, Mail, MapPin, Hash } from 'lucide-react';
import type { Cliente, ClienteFormData, NivelPrecio } from '../types';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ClienteFormData) => Promise<void>;
    cliente: Cliente | null;
}

const ClientModal = ({ isOpen, onClose, onSave, cliente }: ClientModalProps) => {
    const [formData, setFormData] = useState<ClienteFormData>({
        nombreCompleto: '',
        nit: '',
        telefono: '',
        email: '',
        direccion: '',
        nivelPrecioAsignado: 'Publico'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (cliente) {
            setFormData({
                nombreCompleto: cliente.nombreCompleto,
                nit: cliente.nit || '',
                telefono: cliente.telefono || '',
                email: cliente.email || '',
                direccion: cliente.direccion || '',
                nivelPrecioAsignado: cliente.nivelPrecioAsignado
            });
        } else {
            setFormData({
                nombreCompleto: '',
                nit: '',
                telefono: '',
                email: '',
                direccion: '',
                nivelPrecioAsignado: 'Publico'
            });
        }
    }, [cliente, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    <form id="client-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* Nombre */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <User size={14} className="text-indigo-600" /> Nombre Completo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.nombreCompleto}
                                onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm py-2.5"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        {/* NIT y Telefono */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Hash size={14} className="text-gray-500" /> NIT / DPI
                                </label>
                                <input
                                    type="text"
                                    value={formData.nit}
                                    onChange={e => setFormData({ ...formData, nit: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm py-2.5"
                                    placeholder="CF"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Phone size={14} className="text-gray-500" /> Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm py-2.5"
                                    placeholder="5555-5555"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Mail size={14} className="text-gray-500" /> Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm py-2.5"
                                placeholder="cliente@ejemplo.com"
                            />
                        </div>

                        {/* Direccion */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <MapPin size={14} className="text-gray-500" /> Dirección
                            </label>
                            <textarea
                                value={formData.direccion}
                                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm py-2.5 min-h-[80px] resize-none"
                                placeholder="Dirección de facturación..."
                            />
                        </div>

                        {/* Nivel de Precio */}
                        <div className="space-y-1.5 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <label className="text-sm font-bold text-indigo-900 flex items-center gap-1.5 mb-2">
                                <Key size={14} /> Nivel de Precio Asignado
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Publico', 'Mayorista', 'Costo'] as NivelPrecio[]).map((nivel) => (
                                    <label key={nivel} className={`
                                        cursor-pointer text-center rounded-lg border p-2 text-xs font-semibold select-none transition-all
                                        ${formData.nivelPrecioAsignado === nivel
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="nivelPrecio"
                                            value={nivel}
                                            checked={formData.nivelPrecioAsignado === nivel}
                                            onChange={() => setFormData({ ...formData, nivelPrecioAsignado: nivel })}
                                            className="hidden"
                                        />
                                        {nivel}
                                    </label>
                                ))}
                            </div>
                            <p className="text-[10px] text-indigo-700 mt-2">
                                * Determina automáticamente el precio de venta en el POS.
                            </p>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="client-form"
                        disabled={isSubmitting}
                        className="
                            px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg 
                            hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200
                            disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2
                        "
                    >
                        {isSubmitting ? 'Guardando...' : <><Save size={16} /> Guardar Cliente</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientModal;
