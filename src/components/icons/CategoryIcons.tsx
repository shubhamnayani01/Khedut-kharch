import React from "react";
import { svgProps, type IconProps } from "./Icon";
import type { ExpenseCategory } from "../../types";

export function SeedIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M12 21c-4.4-1.2-7-4.7-7-9.2C5 7.8 8.2 4 12 3c3.8 1 7 4.8 7 8.8 0 4.5-2.6 8-7 9.2Z" />
      <path d="M12 21V9" />
      <path d="M12 13c-2 0-3.5-1.3-4-3.2" />
      <path d="M12 17c2 0 3.5-1.2 4-3" />
    </svg>
  );
}

export function FertilizerIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M8 21V11a4 4 0 0 1 8 0v10" />
      <path d="M5 21h14" />
      <path d="M9 21v-6h6v6" />
      <circle cx="12" cy="6" r="2.4" />
    </svg>
  );
}

export function PesticideIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M6 10V6a2 2 0 0 1 2-2h2v3" />
      <rect x="4" y="10" width="9" height="9" rx="1.5" />
      <path d="M13 13.5h6.2c1 0 1.8-.9 1.6-1.9l-.5-2.6" />
      <path d="M17.5 13.5V17" />
      <path d="M8 14.5v3" />
    </svg>
  );
}

export function DieselIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M6 21V9.5L11 4h1l2 2.5" />
      <rect x="6" y="9.5" width="8" height="11.5" rx="1" />
      <path d="M14 12h2.5L19 14.5V19a1.5 1.5 0 0 1-1.5 1.5H16" />
      <circle cx="17.25" cy="19" r="1.2" />
      <path d="M9 14h2" />
    </svg>
  );
}

export function LaborIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <circle cx="12" cy="6" r="2.6" />
      <path d="M5 21v-3.5C5 14.5 8 13 12 13s7 1.5 7 4.5V21" />
      <path d="M8.5 13.2 6 9" />
      <path d="M15.5 13.2 18 9" />
    </svg>
  );
}

export function IrrigationIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M12 3s5 5.6 5 9.4a5 5 0 0 1-10 0C7 8.6 12 3 12 3Z" />
      <path d="M4 20c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" />
    </svg>
  );
}

export function TransportIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M3 16V9a1 1 0 0 1 1-1h9l4 4h2a1 1 0 0 1 1 1v3" />
      <path d="M3 16h17" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
      <path d="M13 8v4" />
    </svg>
  );
}

export function RentIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function ElectricityIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7Z" />
    </svg>
  );
}

export function OtherIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <circle cx="5.5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18.5" cy="12" r="1.4" />
    </svg>
  );
}

export const CATEGORY_ICON_MAP: Record<ExpenseCategory, (p: IconProps) => React.JSX.Element> = {
  seed: SeedIcon,
  fertilizer: FertilizerIcon,
  pesticide: PesticideIcon,
  diesel: DieselIcon,
  labor: LaborIcon,
  irrigation: IrrigationIcon,
  transport: TransportIcon,
  rent: RentIcon,
  electricity: ElectricityIcon,
  other: OtherIcon,
};

export function CategoryIcon({ category, ...props }: { category: ExpenseCategory } & IconProps) {
  const C = CATEGORY_ICON_MAP[category] ?? OtherIcon;
  return <C {...props} />;
}
