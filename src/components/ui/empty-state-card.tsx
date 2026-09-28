import clsx from "clsx";

/** Estado vacío — portado de Kloset/src/components/ui/empty-state-card.tsx. */
export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center", className)}>
      <div className="flex size-[176px] flex-col items-center justify-center gap-3 rounded-lg bg-surface-soft p-6">
        {icon}
        <div className="flex flex-col gap-1">
          <p className="text-body-medium text-text-primary">{title}</p>
          {description && <p className="text-caption text-text-secondary">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
