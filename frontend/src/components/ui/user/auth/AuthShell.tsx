import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

type AuthShellProps = {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const AuthShell = ({
  image,
  imageAlt,
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-700">
      <section className="relative overflow-hidden bg-slate-50">
        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6">
          <div className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative hidden min-h-[576px] overflow-hidden lg:block">
              <img
                src={image}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-sky-950/35 to-slate-900/10" />
              <div className="absolute inset-x-0 bottom-0 p-10 text-white">
                <Link
                  to="/"
                  className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm transition hover:bg-white/15"
                >
                  <ChevronLeft size={16} />
                  Về B-Hub
                </Link>
                <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm">
                  {eyebrow}
                </div>
                <h1 className="mt-5 max-w-lg text-4xl font-bold leading-tight tracking-tight">
                  {title}
                </h1>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-sky-100">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex min-h-[558px] items-center justify-center p-6 sm:p-9">
              <div className="w-full max-w-md">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthShell;
