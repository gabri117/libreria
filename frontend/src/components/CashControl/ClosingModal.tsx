import { useState } from 'react';
import { DollarSign, Save } from 'lucide-react';

interface ClosingModalProps {
    onCloseSesion: (monto: number) => Promise<void>;
    isOpen: boolean;
    onCancel: () => void;
}

export const ClosingModal = ({ onCloseSesion, isOpen, onCancel }: ClosingModalProps) => {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">Cierre de Caja</h2>
                    <p className="text-sm text-gray-500">Ingresa el efectivo total contado.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Monto Final Contado</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-lg font-mono"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !monto}
                                className="
                                    flex-1 bg-red-600 text-white font-bold py-3 rounded-xl
                                    hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200
                                    disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2
                                "
                            >
                                {isSubmitting ? 'Cerrando...' : <><Save size={18} /> Cerrar Caja</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
