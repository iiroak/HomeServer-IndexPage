import clsx from "clsx";

/** Tarjeta estándar — portado de Kloset/src/components/ui/card.tsx. */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("rounded-lg bg-surface p-5 shadow-card", className)} {...props}>
      {children}
    </div>
  );
}

export function SoftCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("rounded-md bg-surface-soft p-4", className)} {...props}>
      {children}
    </div>
  );
}
