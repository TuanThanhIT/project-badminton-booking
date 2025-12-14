import { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Package } from "lucide-react";
import categoryService from "../../../services/Customer/categoryService";
import type { CategoryResponse } from "../../../types/category";

const CategoryMenu = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });

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

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 4, // 4px cách nhẹ dưới nút
        left: window.innerWidth / 2, // canh giữa toàn navbar
      });
    }
  }, [isOpen]);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      {/* Nút SẢN PHẨM */}
      <div
        ref={buttonRef}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium cursor-pointer select-none transition-all duration-200
          ${
            isActive
              ? "text-white underline underline-offset-4 decoration-2 decoration-white"
              : "text-white hover:text-white hover:bg-sky-500/40"
          }`}
      >
        <Package className="w-5 h-5" />
        SẢN PHẨM
        <ChevronDown className="w-4 h-4 ml-1" />
      </div>

      {/* Mega Dropdown */}
      {isOpen && (
        <div
          className="fixed z-50 w-[80vw] max-w-[90rem] -translate-x-1/2 transition-all duration-200"
          style={{
            top: `${dropdownStyle.top}px`,
            left: `${dropdownStyle.left}px`,
          }}
        >
          <div className="bg-white shadow-2xl rounded-b-2xl border-t-4 border-sky-400 p-8">
            <div className="grid grid-cols-5 gap-8">
              {categories.map((group) => (
                <div key={group.menuGroup}>
                  <div className="font-semibold text-sky-700 border-b border-sky-100 mb-3 pb-1 text-sm uppercase">
                    <NavLink
                      to={`/products?group=${encodeURIComponent(
                        group.menuGroup
                      )}`}
                      className="block px-2 py-1 text-gray-700 rounded-md hover:bg-sky-100 hover:text-sky-600 transition duration-150 text-sm whitespace-nowrap"
                      onClick={() => setIsOpen(false)}
                    >
                      {group.menuGroup}
                    </NavLink>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.id}
                        to={`/products?category_id=${
                          item.id
                        }&category_name=${encodeURIComponent(
                          item.cateName
                        )}&group=${encodeURIComponent(group.menuGroup)}`}
                        className="block px-2 py-1 text-gray-700 rounded-md hover:bg-sky-100 hover:text-sky-600 transition duration-150 text-sm whitespace-nowrap"
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
      )}
    </div>
  );
};

export default CategoryMenu;
