import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Package } from "lucide-react";
import { useAppSelector } from "../../../../redux/hook";

const CategoryMenu = () => {
  const categoriesGroup = useAppSelector((state) => state.cate.categoriesGroup);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const isActive = location.pathname.startsWith("/products");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timerRef.current = setTimeout(() => setIsOpen(false), 180);
  };

  const handleClick = () => {
    if (isMobile) setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (buttonRef.current && !isMobile) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownTop(rect.bottom + window.scrollY + 8);
    }
  }, [isOpen, isMobile]);

  const buttonClass = `group relative flex h-11 cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-full px-[18px] text-[15px] font-medium leading-none transition-all after:absolute after:left-[18px] after:right-[18px] after:bottom-2.5 after:h-[2px] after:rounded-full after:transition-all ${
    isActive
      ? "text-yellow-200 after:bg-yellow-200"
      : "text-white after:bg-transparent hover:text-yellow-100"
  }`;

  const iconClass = isActive
    ? "text-yellow-200"
    : "text-white group-hover:text-yellow-100";

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <div ref={buttonRef} onClick={handleClick} className={buttonClass}>
        <Package className={`h-5 w-5 ${iconClass}`} />
        Sản phẩm
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {!isMobile && isOpen && (
        <div
          className="fixed left-1/2 z-50 w-[80vw] max-w-[1180px] -translate-x-1/2"
          style={{ top: `${dropdownTop}px` }}
        >
          <div className="max-h-[70vh] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 bg-sky-50 px-6 py-4">
              <p className="text-sm font-medium text-slate-900">
                Danh mục sản phẩm cầu lông
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Tìm nhanh vợt, giày, phụ kiện và trang bị theo từng nhóm.
              </p>
            </div>

            <div className="max-h-[calc(70vh-82px)] overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                {categoriesGroup.map((group) => (
                  <div key={group.menuGroup}>
                    <NavLink
                      to={`/products?groupName=${encodeURIComponent(group.menuGroup)}`}
                      onClick={() => setIsOpen(false)}
                      className="mb-2 block border-b border-slate-100 pb-2 text-sm font-medium uppercase tracking-wide text-sky-700 transition-colors hover:text-sky-600"
                    >
                      {group.menuGroup}
                    </NavLink>

                    <div className="flex flex-col gap-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.id}
                          to={`/products?cateId=${item.id}&cateName=${encodeURIComponent(
                            item.cateName,
                          )}&groupName=${encodeURIComponent(group.menuGroup)}`}
                          className="rounded-xl px-2 py-1.5 text-sm font-normal text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-800"
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
      )}

      {isMobile && isOpen && (
        <div className="mt-2 max-h-[62vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categoriesGroup.map((group) => (
              <div key={group.menuGroup}>
                <NavLink
                  to={`/products?groupName=${encodeURIComponent(group.menuGroup)}`}
                  onClick={() => setIsOpen(false)}
                  className="mb-2 block text-sm font-medium uppercase tracking-wide text-sky-700"
                >
                  {group.menuGroup}
                </NavLink>

                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={`/products?cateId=${item.id}&cateName=${encodeURIComponent(
                        item.cateName,
                      )}&groupName=${encodeURIComponent(group.menuGroup)}`}
                      className="rounded-xl px-2 py-1.5 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-800"
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
      )}
    </div>
  );
};

export default CategoryMenu;
