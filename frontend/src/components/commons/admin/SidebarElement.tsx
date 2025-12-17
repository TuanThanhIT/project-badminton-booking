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
<<<<<<< HEAD
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
        ${
          active
            ? "bg-sky-600 text-white font-bold shadow"
            : "text-gray-700 hover:bg-sky-100 hover:text-sky-800"
=======
      className={
        "relative flex items-center h-11 py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group" +
        (active
          ? " bg-gradient-to-tr from-blue-200 to-blue-100 text-blue-600"
          : " hover:bg-blue-50 text-gray-600")
      }
    >
      <div className={animation}>
        <Icon />
      </div>

      <span
        className={
          "overflow-hidden transition-all" + (expanded ? " w-35 ml-3" : " w-0")
>>>>>>> dev_admin_thaitoan
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
<<<<<<< HEAD
      {active && (
        <span className="absolute right-3 w-2 h-2 rounded-full bg-white" />
=======
      {/* <span
        className={
          "min-w-0 overflow-hidden transition-all" +
          (expanded ? " max-w-[160px] ml-3" : " max-w-0")
        }
      >
        {text}
      </span> */}
      {alert && (
        <div
          className={
            "absolute right-2 w-2 h-2 rounded bg-blue-600 " +
            (expanded ? "" : "top-1 ")
          }
        />
      )}
      {!expanded && (
        <div
          className={
            "absolute left-full rounded-md px-2 py-1 ml-6 bg-blue-50 text-blue-400 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis"
          }
        >
          {text}
        </div>
>>>>>>> dev_admin_thaitoan
      )}
    </li>
  );
}
