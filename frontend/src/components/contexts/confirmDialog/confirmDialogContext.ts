import { createContext } from "react";
import type { ConfirmDialogPayload } from "../../../utils/confirmDialogStore";

export type ConfirmDialogContextValue = {
  openConfirm: (payload: ConfirmDialogPayload) => Promise<boolean>;
};

export const ConfirmDialogContext =
  createContext<ConfirmDialogContextValue | null>(null);
