import React from 'react';

export type CyberPanelVariant = 'solid-white' | 'solid-dark' | 'outline' | 'glass';
export type CyberPanelChamfer = 'tl-br' | 'tr-bl' | 'all' | 'none';
export type CyberPanelDecorations = 'none' | 'minimal' | 'brackets' | 'lines';
export type CyberPanelStripes = 'none' | 'left' | 'right';

interface CyberPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: CyberPanelVariant;
  chamfer?: CyberPanelChamfer;
  decorations?: CyberPanelDecorations;
  stripes?: CyberPanelStripes;
  padded?: boolean;
  stripeClassName?: string;
}

export default function CyberPanel({
  children,
  variant = 'solid-white',
  chamfer = 'tl-br',
  decorations = 'none',
  stripes = 'none',
  padded = true,
  stripeClassName = 'w-[40%] min-w-[60px] max-w-[120px]',
  className = '',
  ...props
}: CyberPanelProps) {
  const variantClasses: Record<CyberPanelVariant, string> = {
    'solid-white': 'bg-white text-space-bg',
    'solid-dark': 'bg-space-bg text-white border border-white/20',
    'outline': 'bg-transparent border border-white/40 text-white',
    'glass': 'bg-white/5 border border-white/20 backdrop-blur-sm text-white',
  };

  const chamferClasses: Record<CyberPanelChamfer, string> = {
    'tl-br': 'clip-chamfer-tl-br',
    'tr-bl': 'clip-chamfer-tr-bl',
    'all': 'clip-chamfer-all',
    'none': '',
  };

  const isLight = variant === 'solid-white';
  const stripeClass = isLight ? 'stripes-dark opacity-10' : 'stripes-light opacity-10';

  const stripePadding = padded ? (stripes === 'right' ? 'pr-[130px]' : stripes === 'left' ? 'pl-[130px]' : '') : '';

  const renderDecorations = () => {
    switch (decorations) {
      case 'minimal':
        return (
          <>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-40 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-40 pointer-events-none z-0"></div>
          </>
        );
      case 'lines':
        return (
          <>
            <div className="absolute top-0 left-4 w-8 h-[2px] bg-current opacity-40 pointer-events-none z-0"></div>
            <div className="absolute top-4 left-0 w-[2px] h-8 bg-current opacity-40 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 right-4 w-8 h-[2px] bg-current opacity-40 pointer-events-none z-0"></div>
            <div className="absolute bottom-4 right-0 w-[2px] h-8 bg-current opacity-40 pointer-events-none z-0"></div>
          </>
        );
      case 'brackets':
        return (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current opacity-40 pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-current opacity-40 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-current opacity-40 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-current opacity-40 pointer-events-none z-0"></div>
          </>
        );
      default:
        return null;
    }
  };

  const renderStripes = () => {
    if (stripes === 'none') return null;
    const positionClass = stripes === 'left' ? 'left-0' : 'right-0';
    return (
      <div className={`absolute top-0 ${positionClass} h-full pointer-events-none z-0 ${stripeClass} ${stripeClassName}`}></div>
    );
  };

  return (
    <div
      className={`relative ${variantClasses[variant]} ${chamferClasses[chamfer]} ${stripePadding} ${className}`}
      {...props}
    >
      {renderStripes()}
      {renderDecorations()}
      {children}
    </div>
  );
}
