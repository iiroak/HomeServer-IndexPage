import clsx from "clsx";

/** Fila de formulario y campos base — portado de Kloset/src/components/ui/form-row.tsx. */
export function FormRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("flex flex-col gap-1.5", className)}>
      <span className="text-caption text-text-tertiary">{label}</span>
      {children}
    </label>
  );
}

const fieldBaseClasses =
  "w-full rounded-sm border border-border-soft bg-surface px-3.5 py-3 text-body text-text-primary outline-none transition-colors focus:border-accent";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldBaseClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(fieldBaseClasses, className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx(fieldBaseClasses, className)} {...props} />;
}
