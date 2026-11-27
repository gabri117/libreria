import { useState, useEffect } from 'react';
import { Users, Plus, Shield, UserCircle, Key, UserCheck, ShieldCheck, Mail, Search, Loader2, Pencil, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, cambiarEstadoUsuario, ROLES } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        username: '',
        password: '',
        rolId: 2 // Default Vendedor
    });

    const loadUsuarios = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerUsuarios();
            setUsuarios(data);
        } catch (error) {
            toast.error('Error cargando usuarios');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsuarios();
    }, []);

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ nombreCompleto: '', username: '', password: '', rolId: 2 });
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setFormData({
            nombreCompleto: user.nombreCompleto,
            username: user.username,
            password: '',
            rolId: user.rolId
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await actualizarUsuario(editingUser.usuarioId, {
                    nombreCompleto: formData.nombreCompleto,
                    rolId: formData.rolId,
                    password: formData.password.trim() ? formData.password : undefined,
                    activo: editingUser.activo
                });
                toast.success('Usuario actualizado correctamente');
            } else {
                await crearUsuario(formData);
                toast.success('Usuario creado correctamente');
            }
            setIsModalOpen(false);
            setEditingUser(null);
            setFormData({ nombreCompleto: '', username: '', password: '', rolId: 2 });
            loadUsuarios();
        } catch (error: any) {
            toast.error(error?.message || 'Error al guardar usuario');
        }
    };

    const handleToggleActivo = async (user: any) => {
        try {
            await cambiarEstadoUsuario(user.usuarioId, !user.activo);
            toast.success(`Usuario ${!user.activo ? 'activado' : 'desactivado'} correctamente`);
            loadUsuarios();
        } catch (error: any) {
            toast.error(error?.message || 'Error al cambiar estado del usuario');
        }
    };

    const filteredUsuarios = usuarios.filter(u =>
        u.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-primary-500/10 blur-[120px] rounded-full animate-pulse-subtle"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-brand-secondary-500/10 blur-[100px] rounded-full animate-bounce-slow"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Shield className="text-brand-primary-400" size={32} />
                                Gestión de Usuarios
                            </h1>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-11">
                            Control de acceso y administración de personal
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-brand-primary-600/20 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs border border-brand-primary-400/20 group"
                    >
                        <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        Nuevo Usuario
                    </button>
                </div>

                {/* Toolbar/Search */}
                <div className="glass-panel p-4 rounded-3xl mb-8 flex items-center animate-slide-up">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar usuarios por nombre o username..."
                            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-brand-primary-500/20 blur-2xl rounded-full"></div>
                            <Loader2 className="h-12 w-12 animate-spin text-brand-primary-500 relative z-10" strokeWidth={2.5} />
                        </div>
                        <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Sincronizando equipo...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {filteredUsuarios.map((user) => (
                            <div key={user.usuarioId} className="glass-card rounded-[2rem] p-8 border-white/5 hover:border-brand-primary-500/30 transition-all duration-500 group relative overflow-hidden">
                                {/* Hover background effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className={`p-4 rounded-[1.25rem] shadow-lg ${user.rolNombre === 'Administrador'
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                                                : 'bg-brand-primary-500/20 text-brand-primary-400 border border-brand-primary-500/20'
                                                }`}>
                                                <Users size={28} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-lg tracking-tight leading-none mb-2 group-hover:text-brand-primary-400 transition-colors">
                                                    {user.nombreCompleto}
                                                </h3>
                                                <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                                    <UserCircle size={12} />
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.activo
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {user.activo ? 'En línea' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3 text-gray-500 font-black uppercase tracking-widest text-[10px]">
                                                <ShieldCheck size={14} className="text-brand-primary-400" />
                                                Privilegios
                                            </div>
                                            <span className="text-sm font-black text-slate-200 uppercase tracking-tight">{user.rolNombre}</span>
                                        </div>

                                        <div className="pt-2 flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(user)}
                                                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
                                            >
                                                <Pencil size={14} />
                                                Editar
                                            </button>
                                            {currentUser?.usuarioId !== user.usuarioId && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActivo(user)}
                                                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${user.activo
                                                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                                        : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20'
                                                        }`}
                                                >
                                                    <Power size={14} />
                                                    {user.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && filteredUsuarios.length === 0 && (
                    <div className="text-center py-20 opacity-40">
                        <Users size={64} className="mx-auto text-gray-500 mb-4" strokeWidth={1} />
                        <p className="text-white font-black uppercase tracking-widest text-sm">No se encontraron usuarios</p>
                    </div>
                )}

                {/* Create User Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)}></div>

                        <div className="relative w-full max-w-md glass-panel rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden animate-slide-up">
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-5">
                                    <div className="glass-card p-4 rounded-2xl border-white/10 text-brand-primary-400 shadow-lg shadow-brand-primary-500/10">
                                        <UserCheck size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                                            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                        </h2>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2">
                                            {editingUser ? 'Actualizar datos, rol o contraseña' : 'Crear credenciales de acceso'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5">
                                    <Plus size={20} className="rotate-45" strokeWidth={3} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-brand-primary-400 transition-colors">
                                        <Mail size={12} />
                                        Nombre Completo
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej. Juan Pérez"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                                        value={formData.nombreCompleto}
                                        onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-brand-primary-400 transition-colors">
                                        <UserCircle size={12} />
                                        Username
                                    </label>
                                    <input
                                        required
                                        disabled={!!editingUser}
                                        type="text"
                                        placeholder="ej. jperez"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold disabled:opacity-50"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-brand-primary-400 transition-colors">
                                        <Key size={12} />
                                        {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                                    </label>
                                    <input
                                        required={!editingUser}
                                        type="password"
                                        placeholder={editingUser ? 'Dejar vacío para mantener actual' : '••••••••'}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-brand-primary-400 transition-colors">
                                        <ShieldCheck size={12} />
                                        Rol del Sistema
                                    </label>
                                    <select
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold appearance-none cursor-pointer"
                                        value={formData.rolId}
                                        onChange={e => setFormData({ ...formData, rolId: Number(e.target.value) })}
                                    >
                                        {ROLES.map(rol => (
                                            <option key={rol.id} value={rol.id} className="bg-slate-900 text-white">{rol.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-8 py-5 rounded-3xl font-black shadow-xl shadow-brand-primary-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs border border-brand-primary-400/20 mt-4"
                                >
                                    {editingUser ? 'Guardar Cambios' : 'Confirmar Registro'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
