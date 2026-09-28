"use client";

import { useState } from "react";
import type { ServiceNodeTree, NodeCommand } from "../../lib/types";
import { FormRow, Input, Textarea, Select } from "../ui/form-row";
import { Button } from "../ui/button";
import { Chip } from "../ui/chip";
import { showToast } from "../ui/toast";
import { PlusIcon, TrashIcon } from "../ui/icons";
import { IconButton } from "../ui/icon-button";

/**
 * Alta/edición de un nodo (carpeta o enlace). Mismo patrón que Kloset
 * item-edit-form.tsx: los campos de texto viven en el estado como
 * `string`, nunca `null` (un input controlado con value={null} pasa a
 * no-controlado); la conversión a null para el payload ocurre al enviar.
 */
export function NodeForm({
  parentId,
  initial,
  onSaved,
  onCancel,
}: {
  parentId: string | null;
  initial?: ServiceNodeTree;
  onSaved: (node: unknown) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<"folder" | "link">(initial?.kind ?? "link");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(initial?.visibility ?? "private");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [commands, setCommands] = useState<NodeCommand[]>(initial?.commands ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addCommand() {
    setCommands((prev) => [...prev, { label: "", command: "" }]);
  }

  function updateCommand(index: number, field: "label" | "command", value: string) {
    setCommands((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function removeCommand(index: number) {
    setCommands((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nodo necesita un nombre.");
      return;
    }
    if (kind === "link" && !url.trim()) {
      setError("Un enlace necesita una URL.");
      return;
    }

    setError(null);
    setSaving(true);

    const payload = {
      parentId,
      kind,
      name: trimmedName,
      description: description.trim() || null,
      visibility,
      url: kind === "link" ? url.trim() : null,
      commands: commands.filter((c) => c.label.trim() && c.command.trim()),
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const endpoint = initial ? `/api/nodes/${initial.id}` : "/api/nodes";
      const res = await fetch(endpoint, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error === "validacion" ? "Revisa los campos marcados." : "No se pudo guardar.");
        return;
      }
      const node = await res.json();
      showToast(initial ? "Nodo actualizado" : "Nodo creado");
      onSaved(node);
    } catch {
      setError("Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-4">
      <div className="flex gap-2">
        <Chip selected={kind === "link"} onClick={() => setKind("link")} type="button">
          Enlace
        </Chip>
        <Chip selected={kind === "folder"} onClick={() => setKind("folder")} type="button">
          Carpeta
        </Chip>
      </div>

      <FormRow label="Nombre">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Koi" required />
      </FormRow>

      <FormRow label="Descripción">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Opcional" />
      </FormRow>

      {kind === "link" && (
        <FormRow label="URL">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://koi.iroak.dev"
            required
          />
        </FormRow>
      )}

      <FormRow label="Visibilidad">
        <Select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "private")}>
          <option value="private">Privado</option>
          <option value="public">Público</option>
        </Select>
      </FormRow>

      <FormRow label="Tags (separados por coma)">
        <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="admin, infra" />
      </FormRow>

      {kind === "link" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-caption text-text-tertiary">Comandos copiables</span>
            <IconButton aria-label="Añadir comando" onClick={addCommand} type="button">
              <PlusIcon size={20} />
            </IconButton>
          </div>
          {commands.map((cmd, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={cmd.label}
                onChange={(e) => updateCommand(i, "label", e.target.value)}
                placeholder="SSH"
                className="w-24 shrink-0"
              />
              <Input
                value={cmd.command}
                onChange={(e) => updateCommand(i, "command", e.target.value)}
                placeholder="ssh -p 2222 user@host"
                className="flex-1 font-mono"
              />
              <IconButton aria-label="Quitar comando" onClick={() => removeCommand(i)} type="button" className="text-danger">
                <TrashIcon size={18} />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-caption text-danger">{error}</p>}

      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" variant="primary" fullWidth disabled={saving}>
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear"}
        </Button>
        <Button type="button" variant="outline" fullWidth onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
