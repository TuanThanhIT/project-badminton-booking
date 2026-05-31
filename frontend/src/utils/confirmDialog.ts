import {
  showCustomConfirmDialog,
  type ConfirmDialogVariant,
} from "./confirmDialogStore";

/**
 * Custom confirm dialog.
 * Giữ tên hàm cũ để các page đang dùng không cần sửa nhiều.
 */
export const showConfirmDialog = async (
  title: string,
  text: string,
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  variant?: ConfirmDialogVariant,
): Promise<boolean> => {
  return showCustomConfirmDialog({
    title,
    text,
    confirmText,
    cancelText,
    variant,
  });
};
