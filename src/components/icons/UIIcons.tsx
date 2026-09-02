import { svgProps, type IconProps } from "./Icon";

export function PlusIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
export function BackIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}
export function ChevronRightIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
export function EditIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </svg>
  );
}
export function TrashIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M5 7h14" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
export function DownloadIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 4v11" />
      <path d="M7.5 11 12 15.5 16.5 11" />
      <path d="M5 19h14" />
    </svg>
  );
}
export function UploadIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 15V4" />
      <path d="M7.5 8 12 3.5 16.5 8" />
      <path d="M5 19h14" />
    </svg>
  );
}
export function MoonIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
    </svg>
  );
}
export function SunIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
    </svg>
  );
}
export function SearchIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}
export function FilterIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}
export function HomeIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v10h12V10" />
    </svg>
  );
}
export function ChartIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M4 20V10M10 20V4M16 20v-7M4 20h16" />
    </svg>
  );
}
export function SettingsIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
export function CalendarIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3.5v3M16 3.5v3" />
    </svg>
  );
}
export function RupeeIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M6 4h11M6 8.5h11M6 4c4 0 6.5 1.5 6.5 4.5S10 13 6 13h-.5L15 20" />
    </svg>
  );
}
export function LeafIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M5 19c-1-6 2-13 14-15 1 10-4 14-10 15-1.5.2-3 .5-4 0Z" />
      <path d="M6 18c3-4 6-7 12-13" />
    </svg>
  );
}
export function HarvestIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 21c-4.5-.7-8-3.4-8-8.2C4 8.7 7.5 5 12 3c4.5 2 8 5.7 8 9.8 0 4.8-3.5 7.5-8 8.2Z" />
      <path d="M12 21V11" />
    </svg>
  );
}
export function NotebookIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M9 3.5v17" />
      <path d="M12.5 8h3M12.5 11h3M12.5 14h3" />
    </svg>
  );
}
export function AlertIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 3.5 21 19H3L12 3.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.6" r="0.15" fill="currentColor" />
    </svg>
  );
}
export function CheckIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="m5 13 4.5 4.5L19 8" />
    </svg>
  );
}
export function CloseIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
export function CameraIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h1.6L8.3 5h7.4l1.2 2h1.6A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V8.5Z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}
export function ImageIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <rect x="4" y="4.5" width="16" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m6 18 4.5-5 3 3.2L17 12l3 5" />
    </svg>
  );
}
export function DuplicateIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M6 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}
export function ShareIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <circle cx="18" cy="6" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8 10.8 16 7M8 13.2l8 3.8" />
    </svg>
  );
}
export function InstallIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M12 8v6M9.5 11.5 12 14l2.5-2.5" />
      <path d="M10 18h4" />
    </svg>
  );
}
export function ArrowUpIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />
    </svg>
  );
}
export function ArrowDownIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 5v13M6.5 12.5 12 18l5.5-5.5" />
    </svg>
  );
}
export function InfoIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.15" fill="currentColor" />
    </svg>
  );
}
export function FieldIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M3 20 21 20" />
      <path d="M4 20V9l4-3 4 3v11" />
      <path d="M12 20v-7l4-3 4 3v7" />
    </svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

export function RefreshIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function CheckCircleIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

export function XCircleIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

export function SmartphoneIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export function PaperclipIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function HourglassIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
    </svg>
  );
}

export function LockIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function MessageCircleIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export function PinIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

export function UserIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function UsersIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function MenuIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export function LogOutIcon(p: IconProps) {
  return (
    <svg {...svgProps(p.size, p.strokeWidth)} className={p.className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}


