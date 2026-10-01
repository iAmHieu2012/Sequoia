import React from 'react';
import Link from 'next/link';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  href?: string;
}

export default function CyberButton({ 
  children, 
  variant = 'primary',
  className = '', 
  href,
  ...props 
}: CyberButtonProps) {
  const baseClasses = "relative h-12 w-full clip-chamfer-tl-br flex items-center justify-center px-4 overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:outline-none transform-gpu bg-black";
  
  const borders = {
    primary: "border border-white/40 hover:border-white",
    secondary: "border border-white/10 hover:border-white/40",
    danger: "border border-coral/40 hover:border-coral",
  };

  const sweepFills = {
    primary: "bg-white",
    secondary: "bg-white/10",
    danger: "bg-coral",
  };

  const textStyles = {
    primary: "text-white group-hover:text-black",
    secondary: "text-white/70 group-hover:text-white",
    danger: "text-coral group-hover:text-black",
  };

  const combinedClasses = `${baseClasses} ${borders[variant]} ${className}`;

  const innerContent = (
    <>
      <div className={`absolute inset-0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0 ${sweepFills[variant]}`}></div>
      <div className={`relative z-10 flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${textStyles[variant]}`}>
        {children}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button 
      className={combinedClasses}
      {...props}
    >
      {innerContent}
    </button>
  );
}
