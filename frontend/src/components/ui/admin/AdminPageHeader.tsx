import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

const AdminPageHeader = ({ title, subtitle, action }: AdminPageHeaderProps) => (
  <section className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b3f56] text-white shadow-sm">
    <div className="grid gap-5 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-100">
          Admin console
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-3xl text-base leading-7 text-sky-50">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-3">{action}</div> : null}
    </div>
  </section>
);

export default AdminPageHeader;
