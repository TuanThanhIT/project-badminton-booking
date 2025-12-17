import type { LucideProps } from "lucide-react";
import { SideBarContext } from "./Sidebar";
import { useContext } from "react";
type SidebarElementProps = {
  icon: React.ComponentType<LucideProps>;
  text: string;
  active?: boolean;
  alert?: boolean;
  animation?: string;
};
export function SidebarElement({
  icon: Icon,
  text,
  active,
  alert,
  animation,
}: SidebarElementProps) {
  const sideBarContext = useContext(SideBarContext);
  const expanded = sideBarContext?.expanded;
  return (
    <li
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
        }
      >
        {text}
      </span>
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
      )}
    </li>
  );
}
