"use client";

import { useState } from "react";
import type { RepoRef } from "../../lib/types";
import { FormRow, Input, Textarea } from "../ui/form-row";
import { Button } from "../ui/button";
import { showToast } from "../ui/toast";

/**
 * Alta/edición de una referencia a repo de GitHub. Deliberadamente
 * simple: solo lo que el usuario pide — nombre, descripción, icono
 * (favicon/URL de imagen), URL de GitHub. Sin sincronización con la API
 * de GitHub.
 */
export function RepoForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: RepoRef;
  onSaved: (repo: unknown) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? "");
  const [iconRef, setIconRef] = useState(initial?.iconKind === "url" ? initial.iconRef ?? "" : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = githubUrl.trim();
    if (!trimmedName || !trimmedUrl) {
      setError("Nombre y URL de GitHub son obligatorios.");
      return;
    }

    setError(null);
    setSaving(true);

    const payload = {
      name: trimmedName,
      description: description.trim() || null,
      githubUrl: trimmedUrl,
      iconKind: iconRef.trim() ? ("url" as const) : ("favicon" as const),
      iconRef: iconRef.trim() || null,
      pinned: initial?.pinned ?? false,
    };

    try {
      const endpoint = initial ? `/api/repos/${initial.id}` : "/api/repos";
      const res = await fetch(endpoint, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error === "validacion" ? "Revisa los campos (¿URL de github.com?)." : "No se pudo guardar.");
        return;
      }
      const repo = await res.json();
      showToast(initial ? "Repo actualizado" : "Repo agregado");
      onSaved(repo);
    } catch {
      setError("Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-4">
      <FormRow label="Nombre">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Boty" required />
      </FormRow>

      <FormRow label="URL de GitHub">
        <Input
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/iiroak/Boty"
          required
        />
      </FormRow>

      <FormRow label="Descripción">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Opcional" />
      </FormRow>

      <FormRow label="URL de icono (opcional)">
        <Input value={iconRef} onChange={(e) => setIconRef(e.target.value)} placeholder="Sin esto, se usa el favicon de github.com" />
      </FormRow>

      {error && <p className="text-caption text-danger">{error}</p>}

      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" variant="primary" fullWidth disabled={saving}>
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Agregar"}
        </Button>
        <Button type="button" variant="outline" fullWidth onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
