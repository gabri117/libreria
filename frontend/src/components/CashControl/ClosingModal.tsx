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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">Finalizar Jornada de Ventas</h2>
                    <p className="text-sm text-gray-500">Confirma el total para el cierre de caja.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info Card - Expected Amount */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Monto Esperado</p>
                            <p className="text-2xl font-black text-blue-900">Q{esperado.toFixed(2)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAutoFill}
                            className="flex flex-col items-center gap-1 p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-700"
                            title="Llenar con monto esperado"
                        >
                            <Calculator size={20} />
                            <span className="text-[10px] font-bold">Cuadrar</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex justify-between">
                                Monto Final Contado
                                {monto && (
                                    <span className={`text-xs font-bold flex items-center gap-1 ${diferencia === 0 ? 'text-green-600' : diferencia > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {diferencia === 0 ? <><CheckCircle2 size={12} /> Cuadrado</> :
                                            diferencia > 0 ? <><Plus size={12} /> Sobrante: Q{diferencia.toFixed(2)}</> :
                                                <><AlertCircle size={12} /> Faltante: Q{Math.abs(diferencia).toFixed(2)}</>}
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Q</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-2xl font-mono text-gray-800"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Summary of calculations */}
                        {monto && (
                            <div className="text-xs space-y-1 py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-between text-gray-500">
                                    <span>Base Inicial + Ventas:</span>
                                    <span>Q{esperado.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Contado en Caja:</span>
                                    <span>Q{contado.toFixed(2)}</span>
                                </div>
                                <div className={`flex justify-between font-bold border-t border-gray-200 pt-1 mt-1 ${diferencia < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    <span>Diferencia:</span>
                                    <span>Q{diferencia.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-3 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !monto}
                                className="
                                    flex-[2] bg-gray-900 text-white font-bold py-3 rounded-xl
                                    hover:bg-red-600 active:scale-[0.98] transition-all shadow-lg shadow-gray-200
                                    disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed 
                                    flex justify-center items-center gap-2
                                "
                            >
                                {isSubmitting ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                                ) : (
                                    <><Save size={18} /> Finalizar Turno</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
