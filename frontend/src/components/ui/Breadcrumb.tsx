import { NavLink } from "react-router-dom";

type BreadcrumbProps = {
  cate_id: number;
  cate_name: string;
  group_name: string;
};

const Breadcrumb = ({ cate_id, cate_name, group_name }: BreadcrumbProps) => {
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
        to={`/products?group=${encodeURIComponent(group_name)}`}
        className="text-gray-800 hover:text-sky-600"
      >
        {group_name}
      </NavLink>
      {cate_name !== "" ? (
        <div>
          <span>{">"}</span>
          <NavLink
            to={`/products?category_id=${cate_id}&category_name=${encodeURIComponent(
              cate_name
            )}&group=${encodeURIComponent(group_name)}`}
            className="text-gray-800 font-medium hover:text-sky-600"
          >
            {cate_name}
          </NavLink>
        </div>
      ) : (
        ""
      )}
    </nav>
  );
};

export default Breadcrumb;
