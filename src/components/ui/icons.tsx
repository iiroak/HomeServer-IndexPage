/**
 * Set de iconos outline propio — mismo criterio que Kloset (DESIGN.md §8):
 * stroke 1.8–2.2, esquinas redondeadas, sin mezclar familias, todos SVG
 * inline a mano. Los 4 primeros (Folder/Link/Public/Private) más
 * (Repos/Settings) son la identidad de las 4 pestañas de /app.
 */

type IconProps = { size?: number; strokeWidth?: number; className?: string };

const BASE_PROPS = (size: number, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function GlobeIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.8 2.6 4.2 5.8 4.2 9s-1.4 6.4-4.2 9c-2.8-2.6-4.2-5.8-4.2-9s1.4-6.4 4.2-9Z" />
    </svg>
  );
}

export function LockIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function CodeIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M9 6 4 12l5 6" />
      <path d="M15 6l5 6-5 6" />
    </svg>
  );
}

export function SettingsIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.65 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.65a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.65a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.35 9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

export function PlusIcon({ size = 26, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function XIcon({ size = 22, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 24, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function SearchIcon({ size = 20, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function FolderIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M4 6a1 1 0 0 1 1-1h4.2a1 1 0 0 1 .8.4l1.2 1.6H19a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6Z" />
    </svg>
  );
}

export function LinkIcon({ size = 22, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M9 15 15 9" />
      <path d="M11 7l1.3-1.3a3.5 3.5 0 0 1 5 5L16 12" />
      <path d="M13 17l-1.3 1.3a3.5 3.5 0 0 1-5-5L8 12" />
    </svg>
  );
}

export function CopyIcon({ size = 18, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

export function CheckIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M5 12.5 10 17 19 7" />
    </svg>
  );
}

export function TrashIcon({ size = 20, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}

export function PencilIcon({ size = 20, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    </svg>
  );
}

export function StarIcon({ size = 18, strokeWidth = 1.8, className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className} fill={filled ? "currentColor" : "none"}>
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  );
}

export function MoonIcon({ size = 20, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function SunIcon({ size = 20, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
    </svg>
  );
}

export function MoreIcon({ size = 20, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className} fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

export function ExternalLinkIcon({ size = 16, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <path d="M14 5h5v5" />
      <path d="M19 5 10 14" />
      <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function TerminalIcon({ size = 18, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...BASE_PROPS(size, strokeWidth)} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3" />
      <path d="M13 15h4" />
    </svg>
  );
}
