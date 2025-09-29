import { useEffect, useState, useRef } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { ChevronDown, Package } from "lucide-react";
import categoryService from "../../services/categoryService";
import type { CategoryResponse } from "../../types/category";

const CategoryMenu = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();
  const isActive = location.pathname.startsWith("/products");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await categoryService.getCategoriesService();
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };
    fetchCategory();
  }, []);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      {/* Nút Sản phẩm */}
      <div
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
          isActive
            ? "bg-white text-sky-600 shadow-md"
            : "text-white hover:bg-sky-500/40 hover:text-white"
        }`}
      >
        <Package />
        SẢN PHẨM
        <ChevronDown className="w-3 h-3 ml-1" />
      </div>

      {/* Dropdown */}
      <div
        className={`fixed left-0 right-0 top-[140px] z-[100] flex justify-center transition-opacity duration-300
          ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-white shadow-2xl rounded-lg w-[90vw] p-6 max-h-[24rem] overflow-y-auto">
          <div className="grid grid-cols-5 gap-6">
            {categories.map((group) => (
              <div key={group.menuGroup} className="cursor-pointer">
                <div className="font-semibold px-2 py-1 text-sky-700 border-b mb-2 whitespace-nowrap">
                  {group.menuGroup}
                </div>
                <div className="flex flex-col">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={`/products?category_id=${
                        item.id
                      }&category_name=${encodeURIComponent(
                        item.cateName
                      )}&group=${encodeURIComponent(group.menuGroup)}`}
                      className="block px-2 py-1 text-sky-900 hover:bg-sky-200 transition-colors duration-150 whitespace-nowrap"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.cateName}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
