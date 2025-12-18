import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUsuario } from '../services/authService';
import { Key, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Por favor ingresa usuario y contraseña');
            return;
        }

        setIsSubmitting(true);
        try {
            const userData = await loginUsuario({ username, password });
            login(userData);
        } catch (error) {
            console.error(error);
            toast.error('Credenciales inválidas');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 p-8 text-center">
                    <div className="mb-4 inline-flex items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Librería María y José"
                            className="h-20 w-auto object-contain drop-shadow-lg"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Librería María y José</h1>
                    <p className="text-orange-100 text-sm">Sistema de Punto de Venta</p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Usuario</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary-500/20 focus:border-brand-primary-500 outline-none transition-all"
                                    placeholder="Ingresa tu usuario"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Contraseña</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary-500/20 focus:border-brand-primary-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                                w-full bg-brand-primary-500 text-white font-bold py-3.5 rounded-xl
                                hover:bg-brand-primary-600 active:scale-[0.98] transition-all
                                flex items-center justify-center gap-2 shadow-lg shadow-brand-primary-500/30
                                disabled:opacity-70 disabled:cursor-not-allowed
                            "
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Iniciar Sesión</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            © 2025 Librería María y José. Sistema POS v1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
