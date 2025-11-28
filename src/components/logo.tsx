import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
    showText?: boolean;
}

export function Logo({ size = 32, className = '', showText = true }: LogoProps) {
    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Light Mode Logo (Dark Color) */}
                <img
                    src="/logo-dark.png"
                    alt="Logo"
                    width={size}
                    height={size}
                    className="dark:hidden object-contain"
                />
                {/* Dark Mode Logo (Light Color) */}
                <img
                    src="/logo-light.png"
                    alt="Logo"
                    width={size}
                    height={size}
                    className="hidden dark:block object-contain"
                />
            </div>
            {showText && (
                <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    MyDevTools
                </span>
            )}
        </div>
    );
}
