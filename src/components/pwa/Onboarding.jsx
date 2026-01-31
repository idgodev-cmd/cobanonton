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
        <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Background blobs */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500 ${STEPS[currentStep].color.replace('text', 'bg')}/20`} />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800/50">
                        <StepIcon size={40} className={`${STEPS[currentStep].color} transition-colors duration-500`} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3 transition-all duration-300">
                        {STEPS[currentStep].title}
                    </h2>

                    <p className="text-slate-400 mb-8 min-h-[3rem] transition-all duration-300">
                        {STEPS[currentStep].description}
                    </p>

                    <div className="flex gap-2 mb-8">
                        {STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-white' : 'w-2 bg-slate-700'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full py-3.5 bg-primary rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: '#e50914' }}
                    >
                        {currentStep === STEPS.length - 1 ? (
                            <>Get Started <Check size={20} /></>
                        ) : (
                            <>Next <ChevronRight size={20} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
