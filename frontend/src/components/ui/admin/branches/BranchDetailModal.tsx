import { useState, useEffect, useRef } from "react";
import { Eye, X, MapPin, Phone, Upload } from "lucide-react";
import { toast } from "react-toastify";
import adminBranchService from "../../../../services/admin/branchService";
import adminUploadService from "../../../../services/admin/uploadService";
import AdminModal from "../AdminModal";
import { showConfirmDialog } from "../../../../utils/confirmDialog";

type BranchDetailModalProps = {
  branchId: number;
  onClose: () => void;
};

const BranchDetailModal = ({ branchId, onClose }: BranchDetailModalProps) => {
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<{ id: number; imageUrl: string }[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminBranchService
      .getAdminBranchDetailService(branchId)
      .then((res) => {
        const data = (res.data as any).data;
        setBranch(data);
        setImages(data.images || []);
      })
      .catch(() => { toast.error("Không thể tải chi tiết"); onClose(); })
      .finally(() => setLoading(false));
  }, [branchId, onClose]);

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const uploadRes = await adminUploadService.uploadImageService(file);
      const imageUrl  = (uploadRes.data as any).data?.url;
      const res = await adminBranchService.addBranchImageService(branchId, { imageUrl });
      setImages((prev) => [...prev, (res.data as any).data]);
      toast.success("Đã thêm ảnh");
    } catch { toast.error("Upload ảnh thất bại"); }
    finally {
      setUploadingImg(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    const confirmed = await showConfirmDialog(
      "Xóa ảnh chi nhánh?",
      "Ảnh này sẽ bị xóa khỏi chi nhánh.",
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    try {
      await adminBranchService.deleteBranchImageService(branchId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Đã xóa ảnh");
    } catch { toast.error("Không thể xóa ảnh"); }
  };

  return (
    <AdminModal
      title="Chi tiết chi nhánh"
      icon={<Eye className="w-5 h-5 text-sky-600" />}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : branch ? (
        <div className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">{branch.branchName}</h3>
            <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${
              branch.isActive
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-red-100 text-red-600 border-red-200"
            }`}>
              {branch.isActive ? "Hoạt động" : "Tạm ngừng"}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-100">
            <div className="flex items-start gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-500">Địa chỉ</p>
                <p className="text-sm text-slate-700">{branch.fullAddress || branch.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Phone className="w-4 h-4 text-sky-500 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-500">Điện thoại</p>
                <p className="text-sm text-slate-700">{branch.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">
                Hình ảnh ({images.length})
              </p>
              <button type="button" onClick={() => imgInputRef.current?.click()} disabled={uploadingImg}
                className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600 transition hover:bg-sky-100 disabled:opacity-60">
                {uploadingImg
                  ? <div className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  : <Upload className="w-3 h-3" />}
                Thêm ảnh
              </button>
              <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
            </div>
            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((img) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6">
                <Upload className="mb-1 h-6 w-6 text-slate-300" />
                <p className="text-xs font-medium text-slate-500">Chưa có hình ảnh</p>
              </div>
            )}
          </div>

          {branch.description && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Mô tả</p>
              <div
                className="text-sm leading-relaxed text-slate-700 prose prose-sm max-w-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2"
                dangerouslySetInnerHTML={{ __html: branch.description }}
              />
            </div>
          )}

          {branch.managers?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Quản lý phụ trách</p>
              {branch.managers.map((m: any) => (
                <div key={m.id} className="mb-1 flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
                    {(m.fullName || m.username)?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sky-800">{m.fullName || m.username}</p>
                    <p className="text-xs text-sky-500">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {branch.courts?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">
                Sân ({branch.courts.length})
              </p>
              <div className="grid grid-cols-2 gap-2">
                {branch.courts.map((c: any) => (
                  <div key={c.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-sm font-medium text-slate-700">{c.courtName}</p>
                    <p className="text-xs font-medium text-slate-500">{c.courtStatus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </AdminModal>
  );
};

export default BranchDetailModal;
