import { z } from "zod";

/**
 * Esquemas de validación de servidor para /api/nodes y /api/repos.
 * Se ejecutan siempre en la Server Action / endpoint, nunca solo en
 * cliente — el cliente valida imperativamente antes de enviar (patrón de
 * Kloset item-edit-form.tsx) solo para dar feedback rápido, pero el
 * servidor es la autoridad real.
 */

const commandSchema = z.object({
  label: z.string().trim().min(1).max(60),
  command: z.string().trim().min(1).max(2000),
});

export const createNodeSchema = z.object({
  parentId: z.uuid().nullable(),
  kind: z.enum(["folder", "link"]),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  visibility: z.enum(["public", "private"]),
  url: z.url().trim().max(2000).nullable().optional(),
  commands: z.array(commandSchema).max(20).default([]),
  iconKind: z.enum(["favicon", "url", "initials"]).default("favicon"),
  iconRef: z.string().trim().max(2000).nullable().optional(),
  accent: z.string().trim().max(30).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
}).refine((data) => data.kind === "folder" || Boolean(data.url), {
  message: "Un enlace necesita una URL.",
  path: ["url"],
});

export const updateNodeSchema = z.object({
  parentId: z.uuid().nullable().optional(),
  kind: z.enum(["folder", "link"]).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  visibility: z.enum(["public", "private"]).optional(),
  url: z.url().trim().max(2000).nullable().optional(),
  commands: z.array(commandSchema).max(20).optional(),
  iconKind: z.enum(["favicon", "url", "initials"]).optional(),
  iconRef: z.string().trim().max(2000).nullable().optional(),
  accent: z.string().trim().max(30).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
});

export const reorderNodesSchema = z.object({
  orderedIds: z.array(z.uuid()).min(1).max(500),
});

export const createRepoSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  iconKind: z.enum(["favicon", "url", "initials"]).default("favicon"),
  iconRef: z.string().trim().max(2000).nullable().optional(),
  githubUrl: z
    .url()
    .trim()
    .max(500)
    .refine((url) => {
      try {
        return new URL(url).hostname === "github.com";
      } catch {
        return false;
      }
    }, "Debe ser una URL de github.com"),
  pinned: z.boolean().default(false),
});

export const updateRepoSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  iconKind: z.enum(["favicon", "url", "initials"]).optional(),
  iconRef: z.string().trim().max(2000).nullable().optional(),
  githubUrl: z
    .url()
    .trim()
    .max(500)
    .refine((url) => {
      try {
        return new URL(url).hostname === "github.com";
      } catch {
        return false;
      }
    }, "Debe ser una URL de github.com")
    .optional(),
  pinned: z.boolean().optional(),
});
