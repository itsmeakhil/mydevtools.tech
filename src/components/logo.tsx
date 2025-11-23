import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
    showText?: boolean;
}

export function Logo({ size = 32, className = '', showText = true }: LogoProps) {
    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className="relative">
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-transform hover:scale-110 duration-300"
                >
                    <defs>
                        <linearGradient id={`logoGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className="text-primary" style={{ stopColor: 'currentColor' }} />
                            <stop offset="100%" className="text-blue-500" style={{ stopColor: 'currentColor' }} />
                        </linearGradient>
                    </defs>
                    {/* Outer Circle/Ring */}
                    <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke={`url(#logoGradient-${size})`}
                        strokeWidth="2"
                        fill="none"
                        className="opacity-40"
                    />
                    {/* Code Brackets */}
                    <path
                        d="M 10 10 L 6 16 L 10 22"
                        stroke={`url(#logoGradient-${size})`}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    <path
                        d="M 22 10 L 26 16 L 22 22"
                        stroke={`url(#logoGradient-${size})`}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    {/* Center Slash */}
                    <path
                        d="M 18 9 L 14 23"
                        stroke={`url(#logoGradient-${size})`}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            {showText && (
                <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    MyDevTools
                </span>
            )}
        </div>
    );
}
