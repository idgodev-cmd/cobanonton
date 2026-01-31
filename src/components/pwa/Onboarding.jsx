import { useState, useEffect } from 'react';
import { Film, WifiOff, Zap, ChevronRight, Check } from 'lucide-react';

const STEPS = [
    {
        title: "Welcome to Cobanonton",
        description: "Your ultimate destination for movies and series.",
        icon: Film,
        color: "text-blue-500"
    },
    {
        title: "Watch Offline",
        description: "Install the app to browse even when you're offline.",
        icon: WifiOff,
        color: "text-red-500"
    },
    {
        title: "Lighting Fast",
        description: "Experience smooth navigation and instant playback.",
        icon: Zap,
        color: "text-yellow-500"
    }
];

export default function Onboarding() {
    const [show, setShow] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('cobanonton-onboarding');
        if (!hasSeenOnboarding) {
            setShow(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = () => {
        localStorage.setItem('cobanonton-onboarding', 'true');
        setShow(false);
    };

    if (!show) return null;

    const StepIcon = STEPS[currentStep].icon;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800/50 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Dynamic Background */}
                <div className={`absolute top-0 inset-x-0 h-64 bg-gradient-to-b ${STEPS[currentStep].color.replace('text', 'from')}/20 to-transparent transition-colors duration-700`} />
                <div className={`absolute -top-24 -right-24 w-64 h-64 ${STEPS[currentStep].color.replace('text', 'bg')}/10 rounded-full blur-3xl transition-colors duration-700`} />

                <div className="relative z-10 flex flex-col flex-1 p-8">
                    <div className="flex-1 flex flex-col items-center justify-center text-center mt-8">
                        <div className={`w-24 h-24 rounded-3xl bg-slate-800/80 backdrop-blur border border-white/10 flex items-center justify-center mb-8 shadow-xl ring-1 ring-white/5 transition-all duration-500 transform hover:scale-105 group`}>
                            <StepIcon size={48} className={`${STEPS[currentStep].color} drop-shadow-lg transition-transform duration-500 group-hover:rotate-12`} />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight transition-all duration-300 animate-in slide-in-from-bottom-2">
                            {STEPS[currentStep].title}
                        </h2>

                        <p className="text-slate-400 text-lg leading-relaxed mb-8 min-h-[5rem] transition-all duration-300 animate-in slide-in-from-bottom-4 delay-100">
                            {STEPS[currentStep].description}
                        </p>
                    </div>

                    <div className="mt-auto">
                        <div className="flex justify-center gap-3 mb-8">
                            {STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2 rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${idx === currentStep
                                        ? `w-8 ${STEPS[currentStep].color.replace('text', 'bg')}`
                                        : 'w-2 bg-slate-800'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-primary rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
                            style={{ backgroundColor: '#e50914' }}
                        >
                            {currentStep === STEPS.length - 1 ? (
                                <>Get Started <Check size={22} className="group-hover:scale-110 transition-transform" /></>
                            ) : (
                                <>Next <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>

                        {currentStep < STEPS.length - 1 && (
                            <button
                                onClick={finishOnboarding}
                                className="w-full mt-4 text-slate-500 text-sm font-medium hover:text-slate-300 transition-colors"
                            >
                                Skip Intro
                            </button>
                        )}
                        {/* Spacer for skip button consistency */}
                        {currentStep === STEPS.length - 1 && <div className="h-9 mt-4" />}
                    </div>
                </div>
            </div>
        </div>
    );
}
