import type { TextareaHTMLAttributes } from 'react';
import type React from 'react';

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoResizeTextarea({ className = '', onInput, ...props }: AutoResizeTextareaProps) {
    const handleInput = (e: React.InputEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
        
        // Panggil onInput dari props kalau ada
        onInput?.(e);
    };

    return (
        <textarea
        rows={1}
        className={`flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 resize-none outline-none max-h-32 leading-relaxed ${className}`}
        style={{ height: 'auto' }}
        onInput={handleInput}
        {...props}
        />
    );
}
