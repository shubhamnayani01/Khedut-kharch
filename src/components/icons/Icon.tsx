export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function svgProps(size = 24, strokeWidth = 1.75) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}
