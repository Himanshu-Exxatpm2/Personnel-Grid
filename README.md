# Exxat One — Personnel (UI shell prototype)

Prototype of the Personnel grid changes in `Personnel_Discipline_Location_ConfigureColumns_PRD.docx` (v2.2) and
`Personnel_User_Stories.docx`, built inside the design team's UI shell. Design source: `Personnel_Page_Figma_v6`.

## Run
```
npm install
npm run dev        # http://localhost:5178
```
Sign in (Continue) -> choose Site -> sidebar **Personnel**. Direct route: `/site/bedlam-hospital/personnel`.

## What is built (PRD section)
- Discipline and Associated Location(s) columns between Email and Designation, one chip + "+N", full list on hover/focus, "NA" in grey when empty (6.1)
- Discipline and Location filter chips, any-match (OR), "Not Assigned" last in each list (6.2)
- Wrench button after Export with a divider, tooltip "Configure column options" (6.3)
- Configure Column options panel: Reset to default (staged, needs Save), Save in plain blue, COLUMN / ORDER / FREEZE / SHOW, drag or arrows to reorder (6.4)
- Frozen columns (Name left, Status right) cannot be reordered or hidden; Actions is not listed (6.5, 6.6)
- Minimum 3 visible columns, eye toggle disabled up front with tooltip (6.7)
- Save failure keeps the panel open with the arrangement intact, toast with Retry; zero-match filters show the existing empty state (6.8). A checkbox under the grid ("Prototype only") forces the next Save to fail.
- Unfreezing a column unlocks its arrows and eye immediately, no Save needed (6.8)

## Decisions made while building (not in the PRD)
- Frozen-left columns render first and frozen-right last, regardless of their order in the panel.
- Order arrows skip pinned rows and swap with the nearest unpinned row.
- The 3-column floor counts all visible columns, so if Name is unfrozen it is also protected once only 3 remain.
- Saved arrangement persists in the browser (localStorage), standing in for the per-user setting in PRD 7.
- Data is mock (43 people, Bedlam Physical Therapy). Export, Add Personnel, Resend Invite and Reactivate are inert.
- Shell icons come from the Font Awesome kit; the panel and new controls use lucide icons so they render without it.

Files: `src/app/screens/site/personnel/`, `src/app/data/personnel.ts`, route in `src/app/routes.tsx`.
