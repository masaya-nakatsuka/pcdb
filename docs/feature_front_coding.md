# Prompt (AI Use)

Build a **Next.js App Router frontend** using the **Feature/Domain-based (colocation, deep granularity) architecture**.  
The structure MUST include `_components/<Module>/index.tsx + parts/ + *.client.tsx + _shared/` and enforce **guardrails & elevation rules**.

---

## 1. Project assumptions
- Framework: **Next.js App Router** (`app/` directory)
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- State management: **React state / Server Actions**. Global store only when absolutely needed
- Data fetching: **queries.ts (server-only, RSC)**
- Data mutations: **actions.ts ("use server")**
- Default: **RSC**. Only interactive UI → **`.client.tsx`**

---

## 2. Directory structure example (`app/todos`)

app/
  todos/
    page.tsx
    [id]/
      page.tsx
    _components/
      DetailShell/
        index.tsx
        parts/
          SummaryHeader.tsx
          Table/
            index.tsx
            Row.client.tsx
            NewRow.client.tsx
      DetailDrawer.client.tsx
      _shared/
        StatusBadge.tsx
        PriorityChip.tsx
    actions.ts
    queries.ts
    types.ts

---

## 3. Coding rules
1. Keep `page.tsx` thin: only import from `_components/<Module>/index.tsx`
2. Widget (`index.tsx`) must be **RSC** only. No `useState` / `useEffect`
3. Client code must live in Parts (`.client.tsx`)
4. `_shared/` is **internal only**. Never imported outside the module
5. The only externally exposed API is `page.tsx`
6. Use **zod** schemas in `types.ts` and `z.infer` for type safety

---

## 4. Guardrails
- Enforce **ESLint no-restricted-imports**
  - `app/**/_components/**/parts/**` → disallow external import
  - `app/**/_components/_shared/**` → disallow external import
- Enforce dependency direction with lint:
  `app -> features(optional) -> shared` (no reverse imports)
- PR checklist: ensure no `useState/useEffect` inside Widgets

---

## 5. Elevation rules (when to move code)
- If a UI/logic is used in **2+ routes** → move to `features/<domain>/`
- If a Primitive/UI is used in **3+ modules** → move to `shared/components/ui`
- Elevation steps:
  1. Copy from `_components/` to `features/` or `shared/`
  2. Create `index.ts` as the public API
  3. Update imports to go through the barrel
  4. Delete the old implementation

---

## 6. Example implementation

// app/todos/page.tsx
import DetailShell from "./_components/DetailShell";
import { listTodos } from "./queries";

export default async function Page() {
  const data = await listTodos();
  return <DetailShell data={data} />;
}

// app/todos/_components/DetailShell/index.tsx (RSC)
import Table from "./parts/Table";
import SummaryHeader from "./parts/SummaryHeader";

export default function DetailShell({ data }: { data: any }) {
  return (
    <section>
      <SummaryHeader data={data.summary} />
      <Table rows={data.rows} />
    </section>
  );
}

// app/todos/_components/DetailShell/parts/Table/Row.client.tsx (Client)
"use client";
import { useTransition } from "react";
import { toggleTodo } from "../../../actions";

export default function Row({ row }: { row: any }) {
  const [p, start] = useTransition();
  return (
    <li>
      <input
        type="checkbox"
        checked={row.done}
        onChange={() => start(() => toggleTodo(row.id))}
      />
      {p && "…saving"}
    </li>
  );
}

---

## 7. Output requirements
- Generate with **all file paths explicitly stated**
- Add `"use client"` only where required
- Each module must include a `README.md` (dependencies, elevation history, public API)
- ESLint config must include the guardrail rules

---

👉 Generate a project skeleton based on these requirements.
