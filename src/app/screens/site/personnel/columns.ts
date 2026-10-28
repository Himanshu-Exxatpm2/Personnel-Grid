/** Column model + Configure Columns rules (PRD v2.2 §6.4–6.8). */
export type ColumnId =
  | 'name'
  | 'role'
  | 'email'
  | 'discipline'
  | 'location'
  | 'designation'
  | 'lastLogin'
  | 'status';

export type Freeze = 'none' | 'left' | 'right';

export interface ColumnConfig {
  id: ColumnId;
  freeze: Freeze;
  visible: boolean;
}

export const COLUMN_LABEL: Record<ColumnId, string> = {
  name: 'Name',
  role: 'Role & Access',
  email: 'Email',
  discipline: 'Discipline',
  location: 'Associated Location(s)',
  designation: 'Designation',
  lastLogin: 'Last Login',
  status: 'Status',
};

export const COLUMN_WIDTH: Record<ColumnId, number> = {
  name: 230,
  role: 200,
  email: 270,
  discipline: 190,
  location: 230,
  designation: 210,
  lastLogin: 210,
  status: 150,
};

export const SELECT_W = 44;
export const ACTIONS_W = 130;

/** Minimum visible columns (PRD §6.7). */
export const MIN_VISIBLE = 3;

/** PRD §6.1: new columns sit after Email, before Designation. Actions & checkbox are not configurable (§6.5 gap 2, §6.6). */
export const DEFAULT_CONFIG: ColumnConfig[] = [
  { id: 'name', freeze: 'left', visible: true },
  { id: 'role', freeze: 'none', visible: true },
  { id: 'email', freeze: 'none', visible: true },
  { id: 'discipline', freeze: 'none', visible: true },
  { id: 'location', freeze: 'none', visible: true },
  { id: 'designation', freeze: 'none', visible: true },
  { id: 'lastLogin', freeze: 'none', visible: true },
  { id: 'status', freeze: 'right', visible: true },
];

export const visibleCount = (cfg: ColumnConfig[]) => cfg.filter((c) => c.visible).length;

/** Pinned lock tracks the CURRENT freeze value live, saved or not (§6.8 row 4). */
export const isPinned = (c: ColumnConfig) => c.freeze !== 'none';

export type HideBlock = null | 'pinned' | 'floor';
/** Why the eye toggle is disabled for a row, if it is. */
export function hideBlock(cfg: ColumnConfig[], c: ColumnConfig): HideBlock {
  if (isPinned(c)) return 'pinned';
  if (c.visible && visibleCount(cfg) <= MIN_VISIBLE) return 'floor';
  return null;
}

/** Reorder arrows swap with the nearest non-pinned neighbour; pinned rows never move (§6.5 gap 1). */
export function neighbourIndex(cfg: ColumnConfig[], idx: number, dir: -1 | 1): number {
  if (isPinned(cfg[idx])) return -1;
  for (let i = idx + dir; i >= 0 && i < cfg.length; i += dir) {
    if (!isPinned(cfg[i])) return i;
  }
  return -1;
}

export function move(cfg: ColumnConfig[], idx: number, dir: -1 | 1): ColumnConfig[] {
  const j = neighbourIndex(cfg, idx, dir);
  if (j < 0) return cfg;
  const next = cfg.slice();
  [next[idx], next[j]] = [next[j], next[idx]];
  return next;
}

/** Left-pinned first, free columns in saved order, right-pinned last. Visible only. */
export function displayColumns(cfg: ColumnConfig[]): ColumnConfig[] {
  const vis = cfg.filter((c) => c.visible);
  return [
    ...vis.filter((c) => c.freeze === 'left'),
    ...vis.filter((c) => c.freeze === 'none'),
    ...vis.filter((c) => c.freeze === 'right'),
  ];
}

export const sameConfig = (a: ColumnConfig[], b: ColumnConfig[]) =>
  a.length === b.length &&
  a.every((c, i) => c.id === b[i].id && c.freeze === b[i].freeze && c.visible === b[i].visible);

const KEY = 'exxat.personnel.columnConfig.v1';
export function loadConfig(): ColumnConfig[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as ColumnConfig[];
    if (Array.isArray(parsed) && parsed.length === DEFAULT_CONFIG.length) return parsed;
  } catch {
    /* storage unavailable — fall back to defaults */
  }
  return DEFAULT_CONFIG;
}
export function persistConfig(cfg: ColumnConfig[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}
