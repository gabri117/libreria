import { useState } from 'react';
import { DollarSign, Lock } from 'lucide-react';

interface OpeningModalProps {
    onOpen: (monto: number) => Promise<void>;
}

export const OpeningModal = ({ onOpen }: OpeningModalProps) => {
    const [monto, setMonto] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(monto);
        if (isNaN(valor) || valor < 0) return;

        setIsSubmitting(true);
        try {
            await onOpen(valor);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8 animate-fade-in">
                <div className="mx-auto bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                    <Lock size={40} className="text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Caja Cerrada</h2>
                <p className="text-gray-500 mb-8">Debes abrir una nueva sesión de caja para poder realizar ventas.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Monto Inicial en Caja</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-mono"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !monto}
                        className="
                            w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl
                            hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        {isSubmitting ? 'Abriendo Caja...' : 'Abrir Caja'}
                    </button>
                </form>
            </div>
        </div>
    );
};
