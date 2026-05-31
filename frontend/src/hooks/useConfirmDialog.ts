import { useContext } from "react";
import { ConfirmDialogContext } from "../components/contexts/confirmDialog/confirmDialogContext";

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error(
      "useConfirmDialog must be used inside ConfirmDialogProvider",
    );
  }

  return context;
};
