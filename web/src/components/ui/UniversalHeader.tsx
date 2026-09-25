import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";

interface UniversalHeaderProps {
  backHref?: string;
  onBack?: () => void;
  backLabel: string;
  subtitle: string;
  title: React.ReactNode;
  titleIcon?: React.ReactNode;
  statusLabel?: string;
  statusActive?: boolean;
  extraRight?: React.ReactNode;
}

export default function UniversalHeader({
  backHref,
  onBack,
  backLabel,
  subtitle,
  title,
  titleIcon,
  statusLabel,
  statusActive = true,
  extraRight
}: UniversalHeaderProps) {
  const buttonClasses = "inline-flex items-center text-[10px] font-mono tracking-widest uppercase bg-system/5 text-system px-3 lg:px-4 py-2 hover:bg-system/20 hover:text-white transition-all duration-300 relative group overflow-hidden cursor-pointer";

  const buttonContent = (
    <>
      <CyberBrackets color="border-system/30 group-hover:border-system transition-colors duration-300" />
      <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-system)]" />
      <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-system/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
      <span className="relative z-10 flex items-center gap-1 group-hover:drop-shadow-[0_0_8px_var(--color-system)]">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="hidden lg:inline">[ ESC ] {backLabel}</span>
        <span className="lg:hidden">ESC</span>
      </span>
    </>
  );

  return (
    <header className="flex-shrink-0 relative z-50 flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-b border-panel-border bg-black/80 backdrop-blur-md">
      <div className="flex items-center gap-2 lg:gap-6">
        {backHref ? (
          <Link href={backHref} className={buttonClasses}>
            {buttonContent}
          </Link>
        ) : (
          <button onClick={onBack} className={buttonClasses}>
            {buttonContent}
          </button>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase hidden lg:block">
            {subtitle}
          </span>
          <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
            {titleIcon}
            {title}
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 shrink-0">
        {extraRight}

        {extraRight && statusLabel && <div className="w-[1px] h-8 bg-panel-border" />}

        {statusLabel && (
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">SYS_STATUS</span>
            <span className="text-xs font-mono text-system tracking-widest uppercase flex items-center gap-2">
              {statusLabel}
              <span className={`w-2 h-2 ${!statusActive ? 'bg-coral animate-pulse' : 'bg-system shadow-[0_0_8px_var(--color-system)]'}`} />
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
