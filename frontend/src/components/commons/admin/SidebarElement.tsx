import type { LucideProps } from "lucide-react";
import { SideBarContext } from "../../contexts/sidebarContext";
import { useContext } from "react";

type SidebarElementProps = {
  icon: React.ComponentType<LucideProps>;
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
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-blue-50"
      }`}
    >
      <Icon size={20} />
      <span
        className={`transition-all overflow-hidden whitespace-nowrap ${
          expanded ? "w-40" : "w-0"
        }`}
      >
        {text}
      </span>
    </li>
  );
}
