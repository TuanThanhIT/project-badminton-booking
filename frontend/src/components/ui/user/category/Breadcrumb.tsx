import { NavLink } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbProps = {
  cateId?: number;
  cateName?: string;
  groupName: string;
  productId?: number;
  productName?: string;
};

const Breadcrumb = ({
  cateId,
  cateName,
  groupName,
  productId,
  productName,
}: BreadcrumbProps) => {
  return (
    <nav className="w-full overflow-x-auto overflow-y-hidden" aria-label="breadcrumb">
      <div
        className="
          flex min-w-max items-center justify-start gap-1
          whitespace-nowrap text-sm text-slate-500
        "
      >
        <NavLink
          to="/"
          className="
            inline-flex shrink-0 items-center gap-1.5
            rounded-lg px-2 py-1
            font-medium text-slate-600
            transition
            hover:bg-sky-50 hover:text-sky-600
          "
        >
          <Home size={15} />
          Trang chủ
        </NavLink>

        <ChevronRight size={15} className="shrink-0 text-slate-300" />

        <NavLink
          to={`/products?groupName=${encodeURIComponent(groupName)}`}
          title={groupName}
          className="
            inline-block max-w-[160px] shrink-0 truncate
            rounded-lg px-2 py-1
            font-medium text-slate-600
            transition
            hover:bg-sky-50 hover:text-sky-600
            sm:max-w-[220px]
          "
        >
          {groupName || "Sản phẩm"}
        </NavLink>

        {cateName && (
          <>
            <ChevronRight size={15} className="shrink-0 text-slate-300" />

            <NavLink
              to={`/products?cateId=${cateId}&cateName=${encodeURIComponent(
                cateName,
              )}&groupName=${encodeURIComponent(groupName)}`}
              title={cateName}
              className="
                inline-block max-w-[160px] shrink-0 truncate
                rounded-lg px-2 py-1
                font-medium text-slate-600
                transition
                hover:bg-sky-50 hover:text-sky-600
                sm:max-w-[220px]
              "
            >
              {cateName}
            </NavLink>
          </>
        )}

        {productId && productName && (
          <>
            <ChevronRight size={15} className="shrink-0 text-slate-300" />

            <span
              title={productName}
              className="
                inline-block max-w-[280px] shrink-0 truncate
                rounded-lg bg-sky-50 px-2.5 py-1
                font-semibold text-sky-700
                sm:max-w-[420px] lg:max-w-[620px]
              "
            >
              {productName}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default Breadcrumb;
