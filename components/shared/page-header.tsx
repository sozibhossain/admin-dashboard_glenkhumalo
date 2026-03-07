import type { ReactNode } from "react";

type Props = {
  title: string;
  breadcrumbs: string[];
  actions?: ReactNode;
};

export function PageHeader({ title, breadcrumbs, actions }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#1b2333]">{title}</h1>
        <p className="mt-2 text-[16px] text-slate-500">{breadcrumbs.join("  >  ")}</p>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
