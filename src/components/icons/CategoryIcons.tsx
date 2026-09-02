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
      {/* Fertilizer Bag / Sack with Stitching & Sprout */}
      <path d="M6 3h12l1.5 4.5v12.5a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V7.5L6 3z" />
      <line x1="4.5" y1="7" x2="19.5" y2="7" />
      <circle cx="12" cy="14" r="3" />
      <path d="M12 12.5v3" />
      <path d="M10.5 14h3" />
    </svg>
  );
}

export function PesticideIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      {/* Spray Bottle with Mist */}
      <path d="M10 2h4" />
      <path d="M12 2v3" />
      <path d="M9 5h6v3H9z" />
      <path d="M7 10a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9z" />
      <path d="M15 6h4" />
      <path d="M18 4l2-1" />
      <path d="M18 8l2 1" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

export function DieselIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      {/* Fuel Pump / Gas Station Nozzle */}
      <path d="M3 22V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v17" />
      <line x1="2" y1="22" x2="15" y2="22" />
      <rect x="5" y="6" width="6" height="5" rx="1" />
      <path d="M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3" />
    </svg>
  );
}

export function LaborIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      {/* Worker Team / Farmers */}
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IrrigationIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      {/* Water Drop with Waves */}
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      <path d="M4 21c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0" />
    </svg>
  );
}

export function TransportIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      {/* Delivery / Farm Transport Truck */}
      <path d="M1 3h14v13H1z" />
      <path d="M15 8h4.5l3.5 4v4h-8V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function RentIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function ElectricityIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function OtherIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="5" cy="12" r="2" />
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
