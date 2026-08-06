import { svgProps, type IconProps } from "./Icon";

/* ─── Current Condition Icons (larger, detailed) ─────────────────────────── */

export function SunnyIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M3.5 12h-1M21.5 12h-1M5.64 5.64l-.7-.7M19.06 19.06l-.7-.7M5.64 18.36l-.7.7M19.06 4.94l-.7.7" />
    </svg>
  );
}

export function PartlyCloudyIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <circle cx="15" cy="8" r="3.5" />
      <path d="M15 3v1.2M19.95 5.05l-.85.85M21.5 8h-1.2M19.95 10.95l-.85-.85M10.05 5.05l.85.85" />
      <path d="M6.5 21a4 4 0 0 1-.42-7.97A6 6 0 0 1 17.5 15h.5a3 3 0 0 1 0 6H6.5Z" />
    </svg>
  );
}

export function CloudyIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M6 19a4.5 4.5 0 0 1-.47-8.97A6.5 6.5 0 0 1 18 12.5h.5a3.5 3.5 0 0 1 0 7H6Z" />
    </svg>
  );
}

export function FogIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M5 5a4.5 4.5 0 0 1 8.67-1.03A3.5 3.5 0 0 1 17 7.5h.5a2.5 2.5 0 0 1 0 5H5a3 3 0 0 1 0-6Z" />
      <path d="M3 17h18M5 21h14M7 19h10" strokeOpacity="0.5" />
    </svg>
  );
}

export function DrizzleIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M6 14a4 4 0 0 1-.42-7.97A5.5 5.5 0 0 1 16 8h.5a3 3 0 0 1 0 6H6Z" />
      <path d="M8 17v1.5M12 17v1.5M16 17v1.5" strokeLinecap="round" />
    </svg>
  );
}

export function RainIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M6 13a4 4 0 0 1-.42-7.97A5.5 5.5 0 0 1 16 7h.5a3 3 0 0 1 0 6H6Z" />
      <path d="M7 16l-1 3M11 16l-1 3M15 16l-1 3M19 16l-1 3" strokeLinecap="round" />
    </svg>
  );
}

export function HeavyRainIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M6 12a4 4 0 0 1-.42-7.97A5.5 5.5 0 0 1 16 6h.5a3 3 0 0 1 0 6H6Z" />
      <path d="M6 15l-2 4M10 15l-2 4M14 15l-2 4M18 15l-2 4M8 15l-1.5 3M16 15l-1.5 3" strokeLinecap="round" />
    </svg>
  );
}

export function SnowIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M6 13a4 4 0 0 1-.42-7.97A5.5 5.5 0 0 1 16 7h.5a3 3 0 0 1 0 6H6Z" />
      <circle cx="8" cy="17.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="17" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="20" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="19.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ThunderstormIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M6 12a4 4 0 0 1-.42-7.97A5.5 5.5 0 0 1 16 6h.5a3 3 0 0 1 0 6H6Z" />
      <path d="M13 14l-3 5h4l-2 4" strokeLinejoin="round" />
      <path d="M7 15l-1 3M17 15l-1 3" strokeLinecap="round" />
    </svg>
  );
}

export function ThermometerIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z" />
      <circle cx="11.5" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ─── Metric Icons (small) ───────────────────────────────────────────────── */

export function HumidityIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 2.7S6 9.5 6 14a6 6 0 0 0 12 0c0-4.5-6-11.3-6-11.3Z" />
      <path d="M9.5 16.5a2.5 2.5 0 0 0 5 0" strokeOpacity="0.5" />
    </svg>
  );
}

export function WindIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M17.7 7.7A2.5 2.5 0 1 1 19 12H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

export function RainProbIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 2.7S7 8.5 7 12.5a5 5 0 0 0 10 0c0-4-5-9.8-5-9.8Z" />
      <path d="M12 19v2M9 20v1.5M15 20v1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LocationIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 21c-4-4-8-7.5-8-11.5a8 8 0 1 1 16 0c0 4-4 7.5-8 11.5Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
