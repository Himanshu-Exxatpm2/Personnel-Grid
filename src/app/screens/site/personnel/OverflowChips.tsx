import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';

/** Single-chip + "+N" overflow, "NA" when empty (PRD §6.1). Row height never grows. */
export function OverflowChips({ values, label }: { values: string[]; label: string }) {
  if (values.length === 0) {
    return <span className="text-sm text-gray-400 font-['Roboto']">NA</span>;
  }
  const [first, ...rest] = values;
  const full = values.join(', ');
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex items-center gap-1.5 max-w-full cursor-default"
          tabIndex={0}
          aria-label={`${label}: ${full}`}
        >
          <span className="truncate max-w-[150px] rounded-md border border-[#BAC3FD] bg-[#F3F5FF] px-2 py-0.5 text-xs font-medium text-[#3F51B5] font-['Roboto']">
            {first}
          </span>
          {rest.length > 0 && (
            <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 font-['Roboto']">
              +{rest.length}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {full}
      </TooltipContent>
    </Tooltip>
  );
}
