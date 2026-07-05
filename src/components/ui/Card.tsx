import React from "react";

export function Card({
  children,
  className = "",
  stitched = false,
  as: As = "div",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { stitched?: boolean; as?: React.ElementType }) {
  return (
    <As
      className={`bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-[var(--shadow-card)] ${stitched ? "stitch-top" : ""} ${className}`}
      {...rest}
    >
      {children}
    </As>
  );
}
