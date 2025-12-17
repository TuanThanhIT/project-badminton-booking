// SidebarElement.tsx
import { useContext } from "react";
import type { LucideIcon } from "lucide-react";
import { SideBarContext } from "../../contexts/sidebarContext";

type SidebarElementProps = {
  icon: LucideIcon;
  text: string;
  active?: boolean;
};

export function SidebarElement({
  icon: Icon,
  text,
  active,
}: SidebarElementProps) {
  const { expanded } = useContext(SideBarContext)!;

  return (
    <li
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
        ${
          active
            ? "bg-sky-600 text-white font-bold shadow"
            : "text-gray-700 hover:bg-sky-100 hover:text-sky-800"
        }
      `}
    >
      <Icon
        size={20}
        className={
          active ? "text-white" : "text-gray-500 group-hover:text-sky-600"
        }
      />
      <span
        className={`text-sm tracking-wide whitespace-nowrap transition-all duration-300 overflow-hidden ${
          expanded ? "w-40 opacity-100 font-semibold" : "w-0 opacity-0"
        }`}
      >
        {text}
      </span>

      {active && (
        <span className="absolute right-3 w-2 h-2 rounded-full bg-white" />
      )}
    </li>
  );
}
