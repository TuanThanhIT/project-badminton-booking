import { createContext } from "react";

export type SideBarContextType = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SideBarContext = createContext<SideBarContextType | undefined>(
  undefined
);
