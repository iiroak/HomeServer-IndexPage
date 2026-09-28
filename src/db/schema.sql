-- Esquema inicial de index_page.
--
-- nodes: árbol de servicios (carpetas y enlaces). parent_id autorreferenciado
-- permite cualquier profundidad en el schema; la UI solo navega 2 niveles.
-- La visibilidad es del nodo, nunca heredada: una carpeta con hijos públicos
-- y privados aparece en ambas pestañas mostrando solo los hijos que
-- correspondan a cada una.
--
-- repos: espejo manual de referencias a GitHub. NO se sincroniza por API:
-- el usuario pega nombre/descripción/icono/URL a mano desde /app.

-- to_tsvector(regconfig, text) es STABLE, no IMMUTABLE (depende de la
-- config de búsqueda en tiempo de ejecución) — un índice funcional exige
-- IMMUTABLE. Se envuelve en una función propia marcada IMMUTABLE,
-- fijando 'simple' como config: es el arreglo estándar de Postgres para
-- este caso, documentado en la wiki del proyecto.
CREATE OR REPLACE FUNCTION nodes_search_vector(name text, description text, tags text[])
RETURNS tsvector AS $$
  SELECT to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || array_to_string(tags, ' '));
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION repos_search_vector(name text, description text)
RETURNS tsvector AS $$
  SELECT to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''));
$$ LANGUAGE sql IMMUTABLE;

CREATE TABLE IF NOT EXISTS nodes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   uuid REFERENCES nodes(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('folder', 'link')),
  name        text NOT NULL,
  description text,
  visibility  text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  url         text,
  commands    jsonb NOT NULL DEFAULT '[]'::jsonb,
  icon_kind   text NOT NULL DEFAULT 'favicon' CHECK (icon_kind IN ('favicon', 'url', 'initials')),
  icon_ref    text,
  accent      text,
  tags        text[] NOT NULL DEFAULT '{}',
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT link_requires_url CHECK (kind = 'folder' OR url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS nodes_parent_position_idx ON nodes (parent_id, position);
CREATE INDEX IF NOT EXISTS nodes_visibility_idx ON nodes (visibility);
CREATE INDEX IF NOT EXISTS nodes_search_idx ON nodes
  USING gin (nodes_search_vector(name, description, tags));

CREATE TABLE IF NOT EXISTS repos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  icon_kind   text NOT NULL DEFAULT 'favicon' CHECK (icon_kind IN ('favicon', 'url', 'initials')),
  icon_ref    text,
  github_url  text NOT NULL,
  pinned      boolean NOT NULL DEFAULT false,
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS repos_search_idx ON repos
  USING gin (repos_search_vector(name, description));
