import { useMemo, useState } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Checkbox } from '../../../components/ui/checkbox';

export const NOT_ASSIGNED = 'Not Assigned';

interface Props {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  /** Adds a trailing "Not Assigned" option (PRD §6.2). */
  withNotAssigned?: boolean;
  searchable?: boolean;
}

/** rounded-md (not pill) multi-select chip — same interaction as Role/Designation chips. */
export function MultiFilterChip({ label, options, value, onChange, withNotAssigned, searchable }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const all = useMemo(() => (withNotAssigned ? [...options, NOT_ASSIGNED] : options), [options, withNotAssigned]);
  const shown = all.filter((o) => o === NOT_ASSIGNED || o.toLowerCase().includes(q.toLowerCase()));
  const active = value.length > 0;
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ(''); }}>
      <div
        className={`inline-flex items-center rounded-md border text-sm font-['Roboto'] ${
          active ? 'border-[#3F51B5] bg-[#EEF0FF] text-[#2E3D96]' : 'border-[#888888] bg-white text-gray-900'
        }`}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-black/5 transition-colors"
            aria-label={`${label} filter${active ? `, ${value.length} selected` : ''}`}
          >
            <span>{label}</span>
            {active && (
              <span className="rounded bg-[#3F51B5] px-1.5 text-xs font-medium text-white">{value.length}</span>
            )}
            <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </button>
        </PopoverTrigger>
        {active && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3F51B5] text-white hover:bg-[#2E3D96]"
            aria-label={`Clear ${label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <PopoverContent align="start" className="w-64 p-0">
        {searchable && (
          <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="w-full bg-transparent text-sm outline-none font-['Roboto']"
              aria-label={`Search ${label}`}
            />
          </div>
        )}
        <ul className="max-h-64 overflow-y-auto py-1" role="listbox" aria-multiselectable>
          {shown.map((o) => (
            <li key={o} role="option" aria-selected={value.includes(o)}>
              <label
                className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm font-['Roboto'] hover:bg-gray-50 ${
                  o === NOT_ASSIGNED ? 'border-t border-gray-200 text-gray-600' : 'text-gray-900'
                }`}
              >
                <Checkbox checked={value.includes(o)} onCheckedChange={() => toggle(o)} />
                <span className="truncate">{o}</span>
              </label>
            </li>
          ))}
          {shown.length === 0 && <li className="px-3 py-3 text-sm text-gray-500">No matches</li>}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
