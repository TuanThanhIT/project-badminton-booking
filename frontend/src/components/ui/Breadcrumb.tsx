import { NavLink } from "react-router-dom";

type BreadcrumbProps = {
  cateId: number;
  cateName: string;
};

const Breadcrumb = ({ cateId, cateName }: BreadcrumbProps) => {
  return (
    <nav
      className="text-gray-600 flex items-center gap-1"
      aria-label="breadcrumb"
    >
      <NavLink to="/home" className="hover:text-sky-600">
        Trang chủ
      </NavLink>
      <span>{">"}</span>
      <NavLink
        to={`/product?category_id=${cateId}&category_name=${encodeURIComponent(
          cateName
        )}`}
        className="text-gray-800 font-medium hover:text-sky-600"
      >
        {cateName}
      </NavLink>
    </nav>
  );
};

export default Breadcrumb;
