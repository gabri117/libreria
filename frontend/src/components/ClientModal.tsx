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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative">

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary-500 to-transparent opacity-50"></div>

                {/* Header */}
                <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary-500/10 rounded-2xl border border-brand-primary-500/20">
                            <User size={24} className="text-brand-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                                {cliente ? 'Ficha de Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Información de Facturación y Tarifas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 text-gray-500 hover:text-white rounded-2xl hover:bg-white/5 transition-all">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
                    <form id="client-form" onSubmit={handleSubmit} className="space-y-8">

                        <div className="space-y-6">
                            {/* Nombre */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                                    Nombre Completo <span className="text-brand-primary-500">*</span>
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombreCompleto}
                                        onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold placeholder-gray-800"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                            </div>

                            {/* NIT y Telefono */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                                        NIT / Identificación
                                    </label>
                                    <div className="relative group">
                                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary-400 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={formData.nit}
                                            onChange={e => setFormData({ ...formData, nit: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold placeholder-gray-800"
                                            placeholder="C/F"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                                        Teléfono
                                    </label>
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary-400 transition-colors" size={18} />
                                        <input
                                            type="tel"
                                            value={formData.telefono}
                                            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold placeholder-gray-800"
                                            placeholder="5555-0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                                    Correo Electrónico
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary-400 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold placeholder-gray-800"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>

                            {/* Direccion */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                                    Dirección de Entrega
                                </label>
                                <div className="relative group">
                                    <MapPin className="absolute left-5 top-6 text-gray-600 group-focus-within:text-brand-primary-400 transition-colors" size={18} />
                                    <textarea
                                        value={formData.direccion}
                                        onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold placeholder-gray-800 min-h-[100px] resize-none"
                                        placeholder="Dirección completa..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nivel de Precio */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="text-[10px] font-black text-brand-primary-400 uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                                <Key size={14} strokeWidth={3} /> Tarifa Asignada al Cliente
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['Publico', 'Mayorista', 'Costo'] as NivelPrecio[]).map((nivel) => (
                                    <label key={nivel} className={`
                                        cursor-pointer text-center rounded-2xl border py-4 px-2 text-[10px] font-black uppercase tracking-widest select-none transition-all duration-300
                                        ${formData.nivelPrecioAsignado === nivel
                                            ? 'bg-brand-primary-500 text-white border-brand-primary-400 shadow-xl shadow-brand-primary-500/20 scale-105'
                                            : 'bg-white/5 text-gray-500 border-white/5 hover:border-brand-primary-500/30 hover:bg-white/10'}
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
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-white/5 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-4 text-[10px] font-black border border-white/10 text-gray-500 rounded-2xl hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="client-form"
                        disabled={isSubmitting}
                        className="
                            px-8 py-4 text-[10px] font-black text-white bg-brand-primary-600 rounded-2xl 
                            hover:bg-brand-primary-500 active:scale-95 transition-all shadow-2xl shadow-brand-primary-600/20
                            disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-3 uppercase tracking-widest border border-brand-primary-400/20
                        "
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Procesando...</span>
                            </div>
                        ) : <><Save size={18} strokeWidth={2.5} /> Guardar Cambios</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientModal;
