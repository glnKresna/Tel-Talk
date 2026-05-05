import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col">
            {/* Navbar */}
            <header className="px-8 py-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <span className="font-bold text-lg tracking-tight">Tel-Talk</span>
            </header>

            {/* Hero Section */}
            <main className="flex-1 grid grid-cols-1 md:grid-cols-2 max-w-7xl mx-auto w-full px-8 py-12 md:py-0">
                
                {/* Left Column: Content */}
                <div className="flex flex-col justify-center max-w-xl">
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                        Ada Cerita<br />
                        Apa Hari Ini?
                    </h1>

                    <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                        Tempat yang nyaman untuk berbagi ide dan cerita. Tel-Talk menghadirkan pengalaman chatting yang simpel, cepat, dan lebih berwarna.
                    </p>

                    <div className="flex gap-4">
                        <button 
                        onClick={() => navigate('/login')}
                        className="px-8 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all"
                        >
                        Login
                        </button>
                        <button 
                        onClick={() => navigate('/login?state=register')}
                        className="px-8 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white font-medium transition-all"
                        >
                        Sign-up
                        </button>
                    </div>
                </div>

                {/* Right Column: Image Placeholder */}
                <div className="hidden md:flex items-center justify-center p-12">
                    <div className="w-full aspect-[4/3] bg-[#16161f] border border-white/[0.06] rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl">
                        {/* Subtle glow for high-fidelity feel */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px]" />
                        <svg className="w-24 h-24 text-white/[0.05] relative z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h14l-4-5z"/>
                        </svg>
                    </div>
                </div>
            </main>
        </div>
    );
}