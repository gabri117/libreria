import { useState } from 'react';
import { Lock } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="glass-panel border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden text-center p-10 relative">
                {/* Background decorative resplandor */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-primary-500/10 blur-[80px] rounded-full"></div>

                <div className="mx-auto bg-brand-primary-500/10 p-6 rounded-3xl w-24 h-24 flex items-center justify-center mb-8 border border-brand-primary-500/20 shadow-inner group transition-all duration-700 hover:scale-110">
                    <Lock size={44} strokeWidth={2.5} className="text-brand-primary-400 group-hover:rotate-12 transition-transform" />
                </div>

                <div className="space-y-2 mb-10">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Caja Cerrada</h2>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest opacity-60">Apertura de Sesión Requerida</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-left ml-2">Monto Inicial Efectivo</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary-400 font-black text-xl">Q</div>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="
                                    w-full pl-12 pr-6 py-5 
                                    bg-white/5 border border-white/10
                                    rounded-2xl text-white outline-none text-2xl font-black
                                    focus:ring-4 focus:ring-brand-primary-500/10 focus:border-brand-primary-500/40 focus:bg-white/10
                                    transition-all duration-300 placeholder-gray-700
                                "
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !monto}
                        className="
                            w-full bg-gradient-to-r from-brand-primary-600 to-brand-primary-500 text-white font-black py-5 rounded-2xl
                            hover:from-brand-primary-500 hover:to-brand-primary-400 active:scale-[0.98] transition-all 
                            shadow-2xl shadow-brand-primary-600/20 uppercase tracking-[0.2em] text-xs
                            disabled:from-white/5 disabled:to-white/5 disabled:text-gray-600 disabled:shadow-none disabled:cursor-not-allowed
                            border border-brand-primary-400/20
                        "
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Procesando...</span>
                            </div>
                        ) : 'Confirmar Apertura'}
                    </button>
                </form>

                {/* Decorative corner glow */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-primary-500/5 blur-[50px] rounded-full"></div>
            </div>
        </div>
    );
};
