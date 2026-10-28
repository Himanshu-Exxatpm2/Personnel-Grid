import { useMemo, useState } from 'react';
import { Download, RotateCcw, Wrench, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../../../components/ui/sonner';
import { Checkbox } from '../../../components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { PageHeader } from '../../../components/PageHeader';
import {
  ACCESS,
  DESIGNATIONS,
  DISCIPLINES,
  LOCATIONS,
  PersonnelRecord,
  ROLES,
  STATUSES,
  mockPersonnel,
} from '../../../data/personnel';
import { MultiFilterChip, NOT_ASSIGNED } from './MultiFilterChip';
import { OverflowChips } from './OverflowChips';
import { ConfigureColumnsPanel } from './ConfigureColumnsPanel';
import {
  ACTIONS_W,
  COLUMN_LABEL,
  COLUMN_WIDTH,
  ColumnConfig,
  ColumnId,
  SELECT_W,
  displayColumns,
  loadConfig,
  persistConfig,
} from './columns';

/** any-match (OR) across a person's full list; "Not Assigned" matches an empty list (PRD §6.2). */
function matchesMulti(selected: string[], values: string[]) {
  if (selected.length === 0) return true;
  return selected.some((s) => (s === NOT_ASSIGNED ? values.length === 0 : values.includes(s)));
}

const ACCESS_STYLE: Record<string, string> = {
  'System Access': 'bg-green-50 text-green-700',
  'Yet to Login': 'bg-amber-50 text-amber-700',
  'Invite Sent': 'bg-blue-50 text-blue-700',
  'No Access': 'bg-gray-100 text-gray-600',
};

const initials = (n: string) =>
  n.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

function Cell({ id, p }: { id: ColumnId; p: PersonnelRecord }) {
  switch (id) {
    case 'name':
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E4E8FF] text-xs font-medium text-[#3F51B5]">
            {initials(p.name)}
          </span>
          <span className="truncate font-medium text-gray-900">{p.name}</span>
        </div>
      );
    case 'role':
      return (
        <div className="space-y-1 min-w-0">
          <div className="truncate text-gray-900">{p.role}</div>
          <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${ACCESS_STYLE[p.access]}`}>{p.access}</span>
        </div>
      );
    case 'email':
      return <span className="block truncate text-gray-700">{p.email}</span>;
    case 'discipline':
      return <OverflowChips values={p.disciplines} label="Discipline" />;
    case 'location':
      return <OverflowChips values={p.locations} label="Associated Location(s)" />;
    case 'designation':
      return <span className="block truncate text-gray-700">{p.designation ?? '--'}</span>;
    case 'lastLogin':
      return p.lastLogin ? (
        <span className="text-gray-700">{p.lastLogin} IST</span>
      ) : (
        <span className="text-gray-400">NA</span>
      );
    case 'status':
      return (
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
            p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
          }`}
        >
          {p.status}
        </span>
      );
  }
}

export function PersonnelPage() {
  // filters
  const [search, setSearch] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [access, setAccess] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  // paging + selection
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  // columns
  const [config, setConfig] = useState<ColumnConfig[]>(loadConfig);
  const [panelOpen, setPanelOpen] = useState(false);
  const [failNextSave, setFailNextSave] = useState(false);

  const anyFilter =
    search !== '' || [roles, statuses, designations, access, disciplines, locations].some((f) => f.length > 0);
  const resetFilters = () => {
    setSearch(''); setRoles([]); setStatuses([]); setDesignations([]);
    setAccess([]); setDisciplines([]); setLocations([]); setPage(1);
  };
  const withPage = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockPersonnel.filter(
      (p) =>
        (q === '' || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)) &&
        (roles.length === 0 || roles.includes(p.role)) &&
        (statuses.length === 0 || statuses.includes(p.status)) &&
        (designations.length === 0 || (p.designation !== null && designations.includes(p.designation))) &&
        (access.length === 0 || access.includes(p.access)) &&
        matchesMulti(disciplines, p.disciplines) &&
        matchesMulti(locations, p.locations),
    );
  }, [search, roles, statuses, designations, access, disciplines, locations]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const cur = Math.min(page, pages);
  const pageRows = rows.slice((cur - 1) * pageSize, cur * pageSize);

  const kpis = [
    { label: 'Total Personnel', value: mockPersonnel.length },
    { label: 'Personnel with Access', value: mockPersonnel.filter((p) => p.access === 'System Access').length },
    { label: 'Pending Login', value: mockPersonnel.filter((p) => p.access === 'Yet to Login' || p.access === 'Invite Sent').length },
    { label: 'Inactive', value: mockPersonnel.filter((p) => p.status === 'Inactive').length },
  ];

  // columns -> sticky layout
  const cols = displayColumns(config);
  const leftIds = cols.filter((c) => c.freeze === 'left');
  const rightIds = cols.filter((c) => c.freeze === 'right');
  const stickyStyle = (c: ColumnConfig): React.CSSProperties => {
    if (c.freeze === 'left') {
      const off = SELECT_W + leftIds.slice(0, leftIds.indexOf(c)).reduce((s, x) => s + COLUMN_WIDTH[x.id], 0);
      return { position: 'sticky', left: off, zIndex: 2 };
    }
    if (c.freeze === 'right') {
      const off = ACTIONS_W + rightIds.slice(rightIds.indexOf(c) + 1).reduce((s, x) => s + COLUMN_WIDTH[x.id], 0);
      return { position: 'sticky', right: off, zIndex: 2 };
    }
    return {};
  };
  const edgeShadow = (c: ColumnConfig) =>
    c.freeze === 'left' && c === leftIds[leftIds.length - 1]
      ? 'shadow-[4px_0_6px_-4px_rgba(0,0,0,0.18)]'
      : c.freeze === 'right' && c === rightIds[0]
      ? 'shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.18)]'
      : '';
  const tableWidth =
    SELECT_W + ACTIONS_W + cols.reduce((s, c) => s + COLUMN_WIDTH[c.id], 0);

  const allChecked = pageRows.length > 0 && pageRows.every((p) => selected.includes(p.id));
  const someChecked = pageRows.some((p) => selected.includes(p.id));

  const saveConfig = async (next: ColumnConfig[]) => {
    await new Promise((r) => setTimeout(r, 450));
    if (failNextSave) {
      toast.error("Couldn't save your column changes. Try again.", {
        action: { label: 'Retry', onClick: () => { setFailNextSave(false); void retrySave(next); } },
      });
      throw new Error('save failed');
    }
    commit(next);
  };
  const commit = (next: ColumnConfig[]) => {
    setConfig(next);
    persistConfig(next);
    setPanelOpen(false);
    toast.success('Column changes saved');
  };
  const retrySave = async (next: ColumnConfig[]) => {
    await new Promise((r) => setTimeout(r, 300));
    commit(next);
  };

  return (
    <div className="min-h-full bg-neutral-50">
      <Toaster position="bottom-center" />
      <PageHeader
        icon="clipboardUser"
        title="Personnel"
        description="Bedlam Physical Therapy"
        actions={[
          { label: 'Resend Invite', onClick: () => toast('Resend Invite is outside this prototype'), variant: 'secondary' },
          { label: 'Add Personnel', onClick: () => toast('Add Personnel is outside this prototype'), icon: 'plus', variant: 'primary' },
        ]}
      />

      <div className="space-y-4 p-4 sm:p-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className="text-xs font-medium text-[#3F51B5] font-['Roboto']">{k.label}</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 font-['Roboto']">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-3 py-2.5">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email"
              aria-label="Search personnel"
              className="h-9 w-56 rounded-md border border-gray-300 px-3 text-sm font-['Roboto'] outline-none focus:border-[#3F51B5] focus:ring-2 focus:ring-[#3F51B5]/20"
            />
            <span className="mx-1 hidden h-6 w-px bg-gray-300 sm:block" />
            <MultiFilterChip label="Role" options={ROLES} value={roles} onChange={withPage(setRoles)} />
            <MultiFilterChip label="Status" options={STATUSES} value={statuses} onChange={withPage(setStatuses)} />
            <MultiFilterChip label="Designation" options={DESIGNATIONS} value={designations} onChange={withPage(setDesignations)} />
            <MultiFilterChip label="System Access" options={ACCESS} value={access} onChange={withPage(setAccess)} />
            <MultiFilterChip label="Discipline" options={DISCIPLINES} value={disciplines} onChange={withPage(setDisciplines)} withNotAssigned searchable />
            <MultiFilterChip label="Location" options={LOCATIONS} value={locations} onChange={withPage(setLocations)} withNotAssigned searchable />

            <div className="ml-auto flex items-center gap-1">
              {anyFilter && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" onClick={resetFilters} aria-label="Reset filters" className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Reset filters</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" onClick={() => toast('Export is outside this prototype')} aria-label="Export" className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                    <Download className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
              <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(true)}
                    aria-label="Configure column options"
                    data-testid="configure-columns"
                    className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                  >
                    <Wrench className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Configure column options</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-0 text-sm font-['Roboto']" style={{ width: tableWidth, tableLayout: 'fixed', minWidth: '100%' }}>
              <colgroup>
                <col style={{ width: SELECT_W }} />
                {cols.map((c) => <col key={c.id} style={{ width: COLUMN_WIDTH[c.id] }} />)}
                <col style={{ width: ACTIONS_W }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky left-0 z-[3] border-b border-r border-gray-200 bg-[#F1E9FE] text-center" style={{ height: 44 }}>
                    <Checkbox
                      checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                      onCheckedChange={(v) =>
                        setSelected((s) =>
                          v === true
                            ? Array.from(new Set([...s, ...pageRows.map((p) => p.id)]))
                            : s.filter((id) => !pageRows.some((p) => p.id === id)),
                        )
                      }
                      aria-label="Select all rows on this page"
                    />
                  </th>
                  {cols.map((c) => (
                    <th
                      key={c.id}
                      style={stickyStyle(c)}
                      className={`border-b border-r border-gray-200 bg-[#F1E9FE] px-3 text-left text-xs font-medium uppercase tracking-wider text-gray-800 ${edgeShadow(c)}`}
                    >
                      {COLUMN_LABEL[c.id]}
                    </th>
                  ))}
                  <th
                    className="sticky right-0 z-[3] border-b border-gray-200 bg-[#F1E9FE] px-3 text-left text-xs font-medium uppercase tracking-wider text-gray-800"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p) => (
                  <tr key={p.id} className="group" style={{ height: 60 }}>
                    <td className="sticky left-0 z-[1] border-b border-r border-gray-100 bg-white text-center group-hover:bg-gray-50">
                      <Checkbox
                        checked={selected.includes(p.id)}
                        onCheckedChange={(v) =>
                          setSelected((s) => (v === true ? [...s, p.id] : s.filter((id) => id !== p.id)))
                        }
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    {cols.map((c) => (
                      <td
                        key={c.id}
                        style={stickyStyle(c)}
                        className={`overflow-hidden border-b border-gray-100 bg-white px-3 group-hover:bg-gray-50 ${edgeShadow(c)}`}
                      >
                        <Cell id={c.id} p={p} />
                      </td>
                    ))}
                    <td className="sticky right-0 z-[1] border-b border-gray-100 bg-white px-3 group-hover:bg-gray-50">
                      {p.access === 'Invite Sent' ? (
                        <button type="button" onClick={() => toast(`Invite re-sent to ${p.name} (mock)`)} className="rounded-md border border-[#3F51B5] px-2 py-1 text-xs font-medium text-[#3F51B5] hover:bg-[#EEF0FF]">
                          Resend Invite
                        </button>
                      ) : p.status === 'Inactive' ? (
                        <button type="button" onClick={() => toast(`Reactivate is outside this prototype`)} className="rounded-md border border-[#3F51B5] px-2 py-1 text-xs font-medium text-[#3F51B5] hover:bg-[#EEF0FF]">
                          Reactivate
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center font-['Roboto']" data-testid="empty-state">
                <div className="text-base font-medium text-gray-900">No records match your filters</div>
                <p className="text-sm text-gray-500">Try removing a filter or searching for something else.</p>
                <button type="button" onClick={resetFilters} className="mt-1 rounded-md border border-[#3F51B5] px-3 py-1.5 text-sm font-medium text-[#3F51B5] hover:bg-[#EEF0FF]">
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-2.5 text-sm text-gray-600 font-['Roboto']">
            <label className="flex items-center gap-2">
              Rows per page
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(+e.target.value); setPage(1); }}
                className="h-8 rounded-md border border-gray-300 bg-white px-2"
              >
                {[10, 25, 50].map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
            <span>({rows.length} items) · Page {cur} of {pages}</span>
            <div className="flex items-center gap-1">
              {[
                { Icon: ChevronsLeft, go: 1, dis: cur === 1, l: 'First page' },
                { Icon: ChevronLeft, go: cur - 1, dis: cur === 1, l: 'Previous page' },
                { Icon: ChevronRight, go: cur + 1, dis: cur === pages, l: 'Next page' },
                { Icon: ChevronsRight, go: pages, dis: cur === pages, l: 'Last page' },
              ].map(({ Icon, go, dis, l }) => (
                <button key={l} type="button" disabled={dis} onClick={() => setPage(go)} aria-label={l} className="rounded-md p-1.5 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* prototype-only control */}
        <label className="flex w-fit items-center gap-2 rounded-md border border-dashed border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-500 font-['Roboto']">
          <input type="checkbox" checked={failNextSave} onChange={(e) => setFailNextSave(e.target.checked)} />
          Prototype only: make the next Configure Columns Save fail (PRD §6.8)
        </label>
      </div>

      <ConfigureColumnsPanel open={panelOpen} onOpenChange={setPanelOpen} saved={config} onSave={saveConfig} />
    </div>
  );
}
