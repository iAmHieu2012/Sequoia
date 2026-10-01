import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="relative group/input">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className="h-4 w-4 text-white/40 group-focus-within/input:text-white transition-colors" />
          </div>
        )}
        
        {/* Frame based on the outline panel style in index.html */}
        <div className="absolute inset-0 border border-white/40 clip-chamfer-tl-br pointer-events-none group-focus-within/input:border-white transition-colors" />
        
        <input
          ref={ref}
          className={`w-full bg-transparent outline-none transition-all placeholder:text-white/40 text-sm font-mono tracking-wider text-white py-3 pr-4 relative z-10 ${
            Icon ? 'pl-10' : 'pl-4'
          } ${className}`}
          {...props}
        />
        
        {/* Decorative dots in bottom right corner */}
        <div className="absolute bottom-1 right-1 flex gap-[2px] opacity-40 group-focus-within/input:opacity-100 transition-opacity">
          <div className="w-1 h-1 bg-white"></div>
          <div className="w-1 h-1 bg-white"></div>
        </div>
      </div>
    );
  }
);

CyberInput.displayName = 'CyberInput';
export default CyberInput;
