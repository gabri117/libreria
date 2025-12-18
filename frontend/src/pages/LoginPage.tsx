import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUsuario } from '../services/authService';
import { Key, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
                <div className="bg-gradient-to-br from-brand-primary-500 via-brand-primary-600 to-brand-primary-700 p-10 text-center relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full -translate-x-16 -translate-y-16 blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-black/5 rounded-full translate-x-16 translate-y-16 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-6 p-4 bg-white rounded-3xl shadow-2xl shadow-brand-primary-900/40 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <img
                                src="/logo.png"
                                alt="Librería María y José"
                                className="h-24 w-auto object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight leading-tight">
                            Librería <span className="block italic text-brand-primary-100">María y José</span>
                        </h1>
                        <div className="h-1 w-12 bg-white/30 rounded-full mb-4"></div>
                        <p className="text-white/90 text-xs font-bold uppercase tracking-[0.2em]">
                            Sistema de Punto de Venta
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-10 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Usuario</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-brand-primary-500/30 focus:ring-4 focus:ring-brand-primary-500/10 outline-none transition-all text-gray-700 font-medium placeholder:text-gray-300"
                                    placeholder="Nombre de usuario"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary-500 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-brand-primary-500/30 focus:ring-4 focus:ring-brand-primary-500/10 outline-none transition-all text-gray-700 font-medium placeholder:text-gray-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                                w-full bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 text-white font-black py-4 rounded-2xl
                                hover:from-brand-primary-600 hover:to-brand-primary-700 active:scale-[0.97] transition-all
                                flex items-center justify-center gap-3 shadow-xl shadow-brand-primary-500/40
                                disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide
                            "
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>ACCEDER AL SISTEMA</span>
                                    <ArrowRight size={22} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            © 2025 Librería María y José • v1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
