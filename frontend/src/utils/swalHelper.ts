import Swal from "sweetalert2";

/**
 * Hiển thị confirm dialog SweetAlert2
 * @param title - Tiêu đề dialog
 * @param text - Nội dung thông báo
 * @param confirmText - Text cho nút xác nhận
 * @param cancelText - Text cho nút hủy
 * @returns Promise<boolean> - true nếu người dùng xác nhận, false nếu hủy
 */
export const showConfirmDialog = async (
  title: string,
  text: string,
  confirmText = "Đồng ý",
  cancelText = "Hủy",
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
};

export const showTextareaDialog = async ({
  title,
  text,
  placeholder,
  defaultValue = "",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  requiredMessage = "Vui lòng nhập nội dung",
  maxLength = 500,
}: {
  title: string;
  text?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  requiredMessage?: string;
  maxLength?: number;
}): Promise<string | null> => {
  const result = await Swal.fire<string>({
    title,
    text,
    input: "textarea",
    inputValue: defaultValue,
    inputPlaceholder: placeholder,
    inputAttributes: {
      maxlength: String(maxLength),
    },
    inputValidator: (value) => {
      if (!value?.trim()) return requiredMessage;
      return undefined;
    },
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed ? result.value?.trim() || null : null;
};
