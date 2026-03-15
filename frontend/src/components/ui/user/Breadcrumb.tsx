import { NavLink } from "react-router-dom";

type BreadcrumbProps = {
  cateId?: number;
  cateName?: string;
  groupName: string;
  product_id?: number;
  product_name?: string;
};

const Breadcrumb = ({
  cateId,
  cateName,
  groupName,
  product_id,
  product_name,
}: BreadcrumbProps) => {
  return (
    <nav
      className="text-gray-500 flex items-center gap-1 text-sm"
      aria-label="breadcrumb"
    >
      <NavLink to="/home" className="hover:text-sky-600 font-bold">
        TRANG CHỦ
      </NavLink>
      <span className="mx-1">/</span>

      <NavLink
        to={`/products?groupName=${encodeURIComponent(groupName)}`}
        className="hover:text-sky-600"
      >
        {groupName}
      </NavLink>

      {cateName && (
        <>
          <span className="mx-1">/</span>
          <NavLink
            to={`/products?cateId=${cateId}&cateName=${encodeURIComponent(
              cateName,
            )}&groupName=${encodeURIComponent(groupName)}`}
            className="hover:text-sky-600"
          >
            {cateName}
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
