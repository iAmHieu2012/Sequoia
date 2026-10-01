import React from 'react';

interface CyberBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'warning';
  chamfer?: 'tl-br' | 'tr-bl' | 'all';
}

export default function CyberBadge({
  children,
  variant = 'solid',
  chamfer = 'tl-br',
  className = '',
  ...props
}: CyberBadgeProps) {
  const variantClasses = {
    'solid': 'bg-white text-space-bg border border-white',
    'outline': 'bg-transparent text-white border border-white/40',
    'warning': 'bg-white/10 text-white border border-white stripes-dark',
  };

  const chamferClasses = {
    'tl-br': 'clip-chamfer-tl-br',
    'tr-bl': 'clip-chamfer-tr-bl',
    'all': 'clip-chamfer-all',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-mono tracking-widest uppercase ${variantClasses[variant]} ${chamferClasses[chamfer]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
