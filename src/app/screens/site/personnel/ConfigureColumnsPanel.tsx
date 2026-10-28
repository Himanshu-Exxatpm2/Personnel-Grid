import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Lock, X } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../../../components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import {
  COLUMN_LABEL,
  ColumnConfig,
  DEFAULT_CONFIG,
  Freeze,
  MIN_VISIBLE,
  hideBlock,
  isPinned,
  move,
  neighbourIndex,
  sameConfig,
} from './columns';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  saved: ColumnConfig[];
  /** Resolves on success, rejects on failure (PRD §6.8 row 2). */
  onSave: (cfg: ColumnConfig[]) => Promise<void>;
}

/**
 * Built from scratch for Personnel (PRD §6.4): matches the Slot Requests / Schedules panel
 * visually, not a shared component. Every change — including Reset to default — is STAGED
 * until Save; closing discards.
 */
export function ConfigureColumnsPanel({ open, onOpenChange, saved, onSave }: Props) {
  const [draft, setDraft] = useState<ColumnConfig[]>(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(saved);
      setError(false);
    }
  }, [open, saved]);

  const patch = (id: string, p: Partial<ColumnConfig>) =>
    setDraft((d) => d.map((c) => (c.id === id ? { ...c, ...p } : c)));

  const dirty = !sameConfig(draft, saved);
  const atDefault = sameConfig(draft, DEFAULT_CONFIG);

  const doSave = async () => {
    setSaving(true);
    setError(false);
    try {
      await onSave(draft); // parent closes panel on success
    } catch {
      setError(true); // panel stays open, draft preserved exactly as arranged
    } finally {
      setSaving(false);
    }
  };

  const dropOn = (targetIdx: number) => {
    const from = draft.findIndex((c) => c.id === dragId);
    setDragId(null);
    if (from < 0 || from === targetIdx || isPinned(draft[from]) || isPinned(draft[targetIdx])) return;
    const next = draft.slice();
    const [m] = next.splice(from, 1);
    next.splice(targetIdx, 0, m);
    setDraft(next);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-[500px] !max-w-[100vw] gap-0 p-0 font-['Roboto'] sm:!max-w-[500px]"
        aria-describedby="cc-desc"
      >
        {/* sticky header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <SheetTitle className="flex-1 text-base font-medium text-gray-900">Configure Column options</SheetTitle>
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_CONFIG)}
            disabled={atDefault}
            className="rounded-md px-2 py-1.5 text-sm font-medium text-[#2563EB] hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            Reset to default
          </button>
          <button
            type="button"
            onClick={doSave}
            disabled={saving || !dirty}
            className="rounded-md bg-[#2563EB] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1D4FD8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close without saving"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SheetDescription id="cc-desc" className="sr-only">
          Reorder, freeze or hide Personnel grid columns. Changes apply when you press Save.
        </SheetDescription>

        {error && (
          <div role="alert" className="mx-5 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Couldn&apos;t save your column changes. Your arrangement is kept — try again.
          </div>
        )}

        {/* sub-header */}
        <div className="grid grid-cols-[24px_1fr_64px_104px_48px] items-center gap-2 px-5 pb-2 pt-4 text-[11px] font-medium uppercase tracking-wider text-gray-500">
          <span />
          <span>Column</span>
          <span className="text-center">Order</span>
          <span>Freeze</span>
          <span className="text-center">Show</span>
        </div>

        <ul className="flex-1 space-y-2 overflow-y-auto px-5 pb-6">
          {draft.map((c, idx) => {
            const pinned = isPinned(c);
            const block = hideBlock(draft, c);
            const label = COLUMN_LABEL[c.id];
            const up = neighbourIndex(draft, idx, -1) >= 0;
            const down = neighbourIndex(draft, idx, 1) >= 0;
            const orderLabel = pinned ? `${label} (pinned – order locked)` : label;
            return (
              <li
                key={c.id}
                draggable={!pinned}
                onDragStart={() => !pinned && setDragId(c.id)}
                onDragOver={(e) => !pinned && dragId && e.preventDefault()}
                onDrop={() => dropOn(idx)}
                onDragEnd={() => setDragId(null)}
                data-testid={`cc-row-${c.id}`}
                className={`grid grid-cols-[24px_1fr_64px_104px_48px] items-center gap-2 rounded-lg border bg-white px-2 py-2.5 ${
                  dragId === c.id ? 'border-[#2563EB] opacity-60' : 'border-gray-200'
                } ${c.visible ? '' : 'bg-gray-50'}`}
              >
                <span
                  className={`flex justify-center ${pinned ? 'text-gray-300' : 'cursor-grab text-gray-400'}`}
                  aria-hidden
                >
                  {pinned ? <Lock className="h-3.5 w-3.5" /> : <GripVertical className="h-4 w-4" />}
                </span>
                <span className={`truncate text-sm font-medium ${c.visible ? 'text-gray-900' : 'text-gray-400'}`}>
                  {label}
                </span>
                <span className="flex justify-center gap-0.5">
                  <button
                    type="button"
                    disabled={!up}
                    onClick={() => setDraft((d) => move(d, idx, -1))}
                    aria-label={pinned ? orderLabel : `Move ${label} up`}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={!down}
                    onClick={() => setDraft((d) => move(d, idx, 1))}
                    aria-label={pinned ? orderLabel : `Move ${label} down`}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </span>
                <select
                  value={c.freeze}
                  onChange={(e) => patch(c.id, { freeze: e.target.value as Freeze })}
                  aria-label={`Freeze ${label}`}
                  className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="none">None</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
                <span className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={block ? 0 : -1}>
                        <button
                          type="button"
                          disabled={!!block}
                          onClick={() => patch(c.id, { visible: !c.visible })}
                          aria-label={`${c.visible ? 'Hide' : 'Show'} ${label}`}
                          aria-pressed={c.visible}
                          className="rounded p-1.5 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                          {c.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </span>
                    </TooltipTrigger>
                    {block === 'floor' && (
                      <TooltipContent side="left">At least {MIN_VISIBLE} columns must stay visible.</TooltipContent>
                    )}
                    {block === 'pinned' && (
                      <TooltipContent side="left">Frozen columns can&apos;t be hidden. Set Freeze to None first.</TooltipContent>
                    )}
                  </Tooltip>
                </span>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
