import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageHeaderMetric = {
  label: string;
  value: ReactNode;
};

type ManagerPageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  metrics?: PageHeaderMetric[];
  actions?: ReactNode;
};

export const managerCardClass =
  "rounded-2xl border border-slate-200 bg-white";

export const managerInputClass =
  "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-100";

export const managerPrimaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70";

export const managerSecondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70";

export const ManagerPageHeader = ({
  eyebrow,
  title,
  description,
  metrics = [],
  actions,
}: ManagerPageHeaderProps) => (
  <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b3f56] text-white shadow-sm">
    <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-100">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-sky-50">
          {description}
        </p>
      </div>

      {(metrics.length > 0 || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="min-w-40 rounded-2xl border border-white/15 bg-white/10 px-5 py-4"
            >
              <p className="text-xs font-semibold uppercase text-slate-200">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-bold">{metric.value}</p>
            </div>
          ))}
          {actions}
        </div>
      )}
    </div>
  </section>
);

export const ManagerStatCard = ({
  label,
  value,
  icon: Icon,
  iconClassName = "text-sky-600",
  iconBgClassName = "bg-sky-50",
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
}) => (
  <section className={`${managerCardClass} p-4`}>
    <div className="flex items-center gap-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBgClassName}`}
      >
        <Icon className={`h-5 w-5 ${iconClassName}`} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  </section>
);

export const ManagerEmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
    <Icon className="h-11 w-11 text-slate-300" />
    <p className="mt-3 font-semibold text-slate-800">{title}</p>
    {description ? (
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    ) : null}
  </div>
);

export const ManagerModalOverlay = ({ children }: { children: ReactNode }) => (
  <div className="fixed inset-0 z-[1000] flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
    {children}
  </div>
);
