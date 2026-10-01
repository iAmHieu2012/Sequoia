import { ChevronLeft } from "lucide-react";
import CyberButton from "@/components/ui/CyberButton";

interface UniversalHeaderProps {
  backHref?: string;
  onBack?: () => void;
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
  subtitle,
  title,
  titleIcon,
  statusLabel,
  statusActive = true,
  extraRight
}: UniversalHeaderProps) {
  return (
    <header className="flex-shrink-0 sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/10 bg-black/70 backdrop-blur-md gap-4">
      {/* LEFT: ESC */}
      <div className="flex items-center w-1/3">
        <CyberButton 
          href={backHref}
          onClick={onBack}
          variant="secondary"
          className="!w-auto !h-9 lg:!h-10 px-3 lg:px-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden lg:inline ml-1">ESC</span>
        </CyberButton>
      </div>

      {/* CENTER: Status & Extra */}
      <div className="hidden md:flex items-center justify-center w-1/3 shrink-0 gap-6">
        {statusLabel && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-0.5">SYS_STATUS</span>
            <span className="text-xs font-mono text-white tracking-widest uppercase flex items-center gap-2">
              <span className={`w-2 h-2 ${!statusActive ? 'bg-coral animate-pulse' : 'bg-white shadow-[0_0_8px_#ffffff]'}`} />
              {statusLabel}
            </span>
          </div>
        )}
        {extraRight && (
          <>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              {extraRight}
            </div>
          </>
        )}
      </div>

      {/* RIGHT: Title */}
      <div className="flex flex-col min-w-0 items-end text-right w-1/3">
        <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase hidden lg:block mb-0.5 truncate max-w-full">
          {subtitle || "TARGET_IDENTIFIER"}
        </span>
        <span className="text-sm font-mono font-bold text-white tracking-widest uppercase flex items-center justify-end gap-2 w-full truncate">
          <span className="truncate">{title}</span>
          {titleIcon && <span className="shrink-0">{titleIcon}</span>}
        </span>
      </div>
    </header>
  );
}
