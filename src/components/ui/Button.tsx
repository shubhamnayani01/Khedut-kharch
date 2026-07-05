import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "md" | "lg" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-[var(--color-crop-500)] text-white active:bg-[var(--color-crop-600)] shadow-[var(--shadow-card)]",
  secondary: "bg-[var(--color-saffron-500)] text-white active:bg-[var(--color-saffron-600)] shadow-[var(--shadow-card)]",
  outline: "bg-transparent text-[var(--color-ink)] border border-[var(--color-border)] active:bg-[var(--color-paper-dim)]",
  ghost: "bg-transparent text-[var(--color-ink-soft)] active:bg-[var(--color-paper-dim)]",
  danger: "bg-[var(--color-loss-500)] text-white active:bg-[var(--color-loss-600)] shadow-[var(--shadow-card)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-3.5 text-sm gap-1.5",
  md: "h-12 px-5 text-[15px] gap-2",
  lg: "h-14 px-6 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[var(--radius-control)] font-medium transition-colors duration-200 select-none disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
