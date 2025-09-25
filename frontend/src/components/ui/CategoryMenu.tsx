import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, Package } from "lucide-react"; // 👈 thêm icon ở đây
import categoryService from "../../services/categoryService";
import type { CategoryResponse } from "../../types/category";

const CategoryMenu = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await categoryService.getCategoryService();
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };
    fetchCategory();
  }, []);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      {/* Nút Sản phẩm */}
      <div className="flex items-center gap-2 px-5 py-2 rounded-full text-white cursor-pointer select-none hover:bg-sky-500/40 transition-all duration-200 text-sm font-medium">
        <Package /> {/* 👈 Icon nằm trước chữ */}
        Sản phẩm
        <ChevronDown className="w-3 h-3 ml-1" />
      </div>

      {/* Dropdown */}
      <div
        className={`fixed left-0 right-0 top-[140px] z-[100] flex justify-center transition-all duration-300
    ${
      isOpen
        ? "opacity-100 scale-100 pointer-events-auto"
        : "opacity-0 scale-95 pointer-events-none"
    }`}
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="bg-sky-50 shadow-lg rounded-lg w-[80vw] p-6">
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
                      to={`/product/${item.id}`}
                      className="block px-2 py-1 text-sky-900 hover:bg-sky-100 transition-colors duration-150 whitespace-nowrap"
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
