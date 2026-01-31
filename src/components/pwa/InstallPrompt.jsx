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
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">Install App</h3>
                    <p className="text-slate-300 text-sm mb-4">
                        Install Cobanonton for a better experience, offline access, and faster loading.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleInstallClick}
                            className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg font-medium text-white hover:bg-primary/90 transition-colors"
                            style={{ backgroundColor: '#e50914' }} // Netflix red-ish
                        >
                            <Download size={18} />
                            Install Now
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="px-4 py-2 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
