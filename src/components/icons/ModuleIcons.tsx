import { svgProps, type IconProps } from "./Icon";

export function WalletIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
      <path d="M16 10h5v4h-5z" />
    </svg>
  );
}

export function FlaskIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M10 2v6.6l-5 8.4A2 2 0 0 0 6.7 20h10.6a2 2 0 0 0 1.7-3l-5-8.4V2" />
      <path d="M8.5 2h7" />
      <path d="M14 11.5 10 15" />
    </svg>
  );
}

export function WarningIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function ShieldAlertIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function FileTextIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

export function LinkIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function FilterListIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M21 4H3" />
      <path d="M18 10H6" />
      <path d="M14 16h-4" />
    </svg>
  );
}
