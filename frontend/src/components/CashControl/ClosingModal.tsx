import { useState } from 'react';
import { Save, Calculator, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import type { SesionCaja } from '../../types';

interface ClosingModalProps {
    onCloseSesion: (monto: number) => Promise<void>;
    isOpen: boolean;
    onCancel: () => void;
    sesion: SesionCaja | null;
}

export const ClosingModal = ({ onCloseSesion, isOpen, onCancel, sesion }: ClosingModalProps) => {
    const [monto, setMonto] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(monto);
        if (isNaN(valor) || valor < 0) return;

        setIsSubmitting(true);
        try {
            await onCloseSesion(valor);
        } finally {
            setIsSubmitting(false);
        }
    };

    const esperado = sesion?.montoFinalEsperado || 0;
    const contado = parseFloat(monto) || 0;
    const diferencia = contado - esperado;

    const handleAutoFill = () => {
        setMonto(esperado.toString());
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="glass-panel border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative">

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary-500 to-transparent opacity-50"></div>

                {/* Header */}
                <div className="p-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-brand-primary-500/10 rounded-2xl border border-brand-primary-500/20">
                            <AlertCircle size={24} className="text-brand-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Cierre de Jornada</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Verificación de Caja Final</p>
                        </div>
                    </div>
                </div>

                <div className="p-10 pt-8 space-y-8">
                    {/* Info Card - Expected Amount */}
                    <div className="glass-card border-brand-primary-500/10 rounded-[2rem] p-6 flex items-center justify-between group overflow-hidden relative">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-brand-primary-400 uppercase tracking-[0.2em] mb-2">Monto Esperado en Sistema</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-white/50">Q</span>
                                <p className="text-4xl font-black text-white tracking-tighter">{esperado.toFixed(2)}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAutoFill}
                            className="relative z-10 flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-brand-primary-500 text-brand-primary-400 hover:text-white rounded-[1.5rem] transition-all duration-300 border border-white/5 hover:border-brand-primary-400 active:scale-90"
                            title="Llenar con monto esperado"
                        >
                            <Calculator size={24} strokeWidth={2.5} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Cuadrar</span>
                        </button>
                        {/* Glow effect for card */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-primary-500/5 blur-3xl rounded-full"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex justify-between ml-2">
                                Efectivo Contado en Caja
                                {monto && (
                                    <span className={`flex items-center gap-2 px-3 py-1 rounded-lg ${diferencia === 0 ? 'bg-emerald-500/20 text-emerald-400' : diferencia > 0 ? 'bg-brand-primary-500/20 text-brand-primary-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {diferencia === 0 ? <><CheckCircle2 size={12} strokeWidth={3} /> Cuadrado</> :
                                            diferencia > 0 ? <><Plus size={12} strokeWidth={3} /> Sobrante: Q{diferencia.toFixed(2)}</> :
                                                <><AlertCircle size={12} strokeWidth={3} /> Faltante: Q{Math.abs(diferencia).toFixed(2)}</>}
                                    </span>
                                )}
                            </label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary-400 font-black text-2xl group-focus-within:text-white transition-colors">Q</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    className="
                                        w-full pl-14 pr-8 py-6 
                                        bg-white/5 border border-white/10
                                        rounded-[1.5rem] text-white outline-none text-4xl font-black
                                        focus:ring-4 focus:ring-brand-primary-500/10 focus:border-brand-primary-500/40 focus:bg-white/10
                                        transition-all duration-300 placeholder-gray-800
                                    "
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Summary of calculations */}
                        {monto && (
                            <div className="text-[10px] font-black uppercase tracking-[0.15em] space-y-3 p-6 glass-panel rounded-2xl border-white/5 animate-slide-up">
                                <div className="flex justify-between text-gray-500">
                                    <span>Base + Ventas:</span>
                                    <span className="text-white">Q{esperado.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Contado Real:</span>
                                    <span className="text-white">Q{contado.toFixed(2)}</span>
                                </div>
                                <div className={`flex justify-between pt-3 border-t border-white/5 mt-2 ${diferencia < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    <span>Diferencia Final:</span>
                                    <span className="text-lg">Q{diferencia.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-6 py-5 bg-white/5 text-gray-500 font-black rounded-2xl border border-white/5 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !monto}
                                className="
                                    flex-[2] bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black py-5 rounded-2xl
                                    hover:from-red-600 hover:to-red-500 active:scale-[0.98] transition-all duration-500 
                                    shadow-2xl shadow-black/40 uppercase tracking-[0.2em] text-xs
                                    disabled:from-white/5 disabled:to-white/5 disabled:text-gray-700 disabled:shadow-none disabled:cursor-not-allowed
                                    flex justify-center items-center gap-3 border border-white/5
                                "
                            >
                                {isSubmitting ? (
                                    <><div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" /> Procesando...</>
                                ) : (
                                    <><Save size={20} className="opacity-60" /> Cerrar Caja</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
