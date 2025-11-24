import { NavLink } from "react-router-dom";

type BreadcrumbProps = {
  cate_id?: number;
  cate_name?: string;
  group_name: string;
  product_id?: number;
  product_name?: string;
};

const Breadcrumb = ({
  cate_id,
  cate_name,
  group_name,
  product_id,
  product_name,
}: BreadcrumbProps) => {
  return (
    <nav
      className="text-gray-500 flex items-center gap-1 text-sm"
      aria-label="breadcrumb"
    >
      <NavLink to="/home" className="hover:text-sky-600">
        Trang chủ
      </NavLink>
      <span className="mx-1">/</span>

      <NavLink
        to={`/products?group=${encodeURIComponent(group_name)}`}
        className="hover:text-sky-600"
      >
        {group_name}
      </NavLink>

      {cate_name && (
        <>
          <span className="mx-1">/</span>
          <NavLink
            to={`/products?category_id=${cate_id}&category_name=${encodeURIComponent(
              cate_name
            )}&group=${encodeURIComponent(group_name)}`}
            className="hover:text-sky-600"
          >
            {cate_name}
          </NavLink>
        </>
      )}

      {product_id && product_name && (
        <>
          <span className="mx-1">/</span>
          <span className="text-gray-900 font-semibold">{product_name}</span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
