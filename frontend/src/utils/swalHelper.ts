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
