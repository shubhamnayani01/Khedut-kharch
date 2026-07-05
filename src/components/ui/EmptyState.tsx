import React from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-16 h-16 rounded-full bg-[var(--color-crop-50)] text-[var(--color-crop-500)] flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[17px] font-semibold text-[var(--color-ink)] mb-1.5">{title}</p>
      {description && <p className="text-[15px] text-[var(--color-ink-faint)] max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
