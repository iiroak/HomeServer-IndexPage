"use client";

import { LargeTitleHeader } from "../ui/top-bar";
import { ListRow } from "../ui/list-row";
import { SunIcon, MoonIcon } from "../ui/icons";
import { useTheme } from "./use-theme";

export function SettingsView({ email }: { email: string | null }) {
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="flex flex-1 flex-col pb-8">
      <LargeTitleHeader title="Ajustes" />
      <div className="flex flex-col divide-y divide-divider">
        <ListRow label="Sesión" value={email ?? "Local (dev)"} chevron={false} />
        <ListRow
          label="Tema"
          value={
            <span className="flex items-center gap-1.5">
              {theme === "dark" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              {theme === "dark" ? "Oscuro" : "Claro"}
            </span>
          }
          onClick={toggleTheme}
        />
      </div>
    </div>
  );
}
