import type { ReactNode, ButtonHTMLAttributes } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: ReactNode;
    variant?: 'primary' | 'ai' | 'ghost';
};

export function IconButton({ icon, variant = 'primary', className = '', ...props }: IconButtonProps) {
    const baseStyle = "flex items-center justify-center transition-all flex-shrink-0 mb-0.5 disabled:opacity-30 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 text-white",
        ai: "w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white",
        ghost: "text-zinc-500 hover:text-violet-400 bg-transparent"
    };

    return (
        <button 
        className={`${baseStyle} ${variants[variant]} ${className}`}
        {...props}
        >
        {icon}
        </button>
    );
}