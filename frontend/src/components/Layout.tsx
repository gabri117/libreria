import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Subtle premium background effects */}
            <div className="fixed inset-0 bg-[#020617] -z-20"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 pointer-events-none -z-10"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary-500/10 rounded-full blur-[120px] -z-10"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-secondary-500/10 rounded-full blur-[100px] -z-10"></div>

            <Navbar />
            <main className="flex-1 flex flex-col relative">
                <div className="max-w-full mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
