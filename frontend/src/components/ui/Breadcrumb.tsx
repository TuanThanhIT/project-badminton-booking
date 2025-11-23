import { NavLink } from "react-router-dom";

type BreadcrumbProps = {
  cate_id: number;
  cate_name: string;
};

const Breadcrumb = ({ cate_id, cate_name }: BreadcrumbProps) => {
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
        to={`/products?category_id=${cate_id}&category_name=${encodeURIComponent(
          cate_name
        )}`}
        className="text-gray-800 font-medium hover:text-sky-600"
      >
        {cate_name}
      </NavLink>
    </nav>
  );
};

export default Breadcrumb;
