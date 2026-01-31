import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95 duration-300 relative overflow-hidden group"
            >
                {/* Glow effects */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-500" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500" />

                <div className="relative z-10">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-0 right-0 p-1 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full hover:bg-slate-700"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/5 mx-auto">
                            <img src="/pwa-192x192.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Install Cobanonton</h3>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            Get the best streaming experience with our dedicated app. Watch offline, smoother playback, and instant access.
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={handleInstallClick}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-rose-600 px-4 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                style={{ backgroundImage: 'linear-gradient(to right, #e50914, #ff4b5c)' }}
                            >
                                <Download size={20} />
                                Install App
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="w-full px-4 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
