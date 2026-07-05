import React from "react";

function FieldShell({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[15px] font-medium text-[var(--color-ink)] mb-2">
        {label} {required && <span className="text-[var(--color-loss-500)]">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block mt-1.5 text-sm text-[var(--color-ink-faint)]">{hint}</span>}
      {error && <span className="block mt-1.5 text-sm text-[var(--color-loss-500)]">{error}</span>}
    </label>
  );
}

const controlBase =
  "w-full min-h-[48px] rounded-[var(--radius-control)] border bg-[var(--color-surface)] px-4 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors duration-150 focus:border-[var(--color-crop-500)]";

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; required?: boolean }
>(({ label, error, hint, required, className = "", ...rest }, ref) => (
  <FieldShell label={label} error={error} hint={hint} required={required}>
    <input
      ref={ref}
      className={`${controlBase} h-12 ${error ? "border-[var(--color-loss-500)]" : "border-[var(--color-border)]"} ${className}`}
      {...rest}
    />
  </FieldShell>
));
TextInput.displayName = "TextInput";

export const NumberInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; required?: boolean }
>(({ label, error, hint, required, className = "", ...rest }, ref) => (
  <FieldShell label={label} error={error} hint={hint} required={required}>
    <input
      ref={ref}
      type="number"
      inputMode="decimal"
      className={`${controlBase} h-12 tnum ${error ? "border-[var(--color-loss-500)]" : "border-[var(--color-border)]"} ${className}`}
      {...rest}
    />
  </FieldShell>
));
NumberInput.displayName = "NumberInput";

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string; required?: boolean }
>(({ label, error, hint, required, className = "", ...rest }, ref) => (
  <FieldShell label={label} error={error} hint={hint} required={required}>
    <textarea
      ref={ref}
      rows={3}
      className={`${controlBase} py-3 resize-none ${error ? "border-[var(--color-loss-500)]" : "border-[var(--color-border)]"} ${className}`}
      {...rest}
    />
  </FieldShell>
));
TextArea.displayName = "TextArea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string; required?: boolean }
>(({ label, error, hint, required, className = "", children, ...rest }, ref) => (
  <FieldShell label={label} error={error} hint={hint} required={required}>
    <select
      ref={ref}
      className={`${controlBase} h-12 appearance-none bg-no-repeat ${error ? "border-[var(--color-loss-500)]" : "border-[var(--color-border)]"} ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2356604f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 14px center",
        paddingRight: "40px",
      }}
      {...rest}
    >
      {children}
    </select>
  </FieldShell>
));
Select.displayName = "Select";
