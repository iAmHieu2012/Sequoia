"use client";

export default function CyberGrid({ opacity = "opacity-50" }: { opacity?: string }) {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${opacity}`} style={{
      backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-system) 3%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-system) 3%, transparent) 1px, transparent 1px)',
      backgroundSize: '40px 40px'
    }} />
  );
}
