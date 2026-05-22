export type ConfirmDialogVariant =
  | "question"
  | "danger"
  | "warning"
  | "success";

export type ConfirmDialogPayload = {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
};

let globalOpenConfirm:
  | ((payload: ConfirmDialogPayload) => Promise<boolean>)
  | null = null;

export const bindConfirmDialog = (
  handler: (payload: ConfirmDialogPayload) => Promise<boolean>,
) => {
  globalOpenConfirm = handler;

  return () => {
    globalOpenConfirm = null;
  };
};

export const showCustomConfirmDialog = async (
  payload: ConfirmDialogPayload,
): Promise<boolean> => {
  if (!globalOpenConfirm) {
    return window.confirm(
      [payload.title, payload.text].filter(Boolean).join("\n"),
    );
  }

  return globalOpenConfirm(payload);
};
