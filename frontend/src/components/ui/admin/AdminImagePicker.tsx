import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
import adminUploadService from "../../../services/admin/uploadService";

type AdminImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  height?: string;
};

const AdminImagePicker = ({ value, onChange, label = "Ảnh", height = "h-32" }: AdminImagePickerProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await adminUploadService.uploadImageService(file);
      const url = (res.data as any).data?.url;
      onChange(url);
      setPreview(url);
    } catch {
      toast.error("Upload ảnh thất bại");
      setPreview(value);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative w-full ${height} rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition
          ${uploading ? "border-sky-300 bg-sky-50" : "border-gray-300 hover:border-sky-400 hover:bg-sky-50/40"}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="w-full h-full object-contain rounded-xl p-1"
              onError={() => setPreview("")} />
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <p className="text-white text-xs font-semibold">Nhấn để thay đổi</p>
            </div>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <p className="text-xs text-gray-400">Nhấn để chọn ảnh</p>
            <p className="text-xs text-gray-300 mt-0.5">PNG, JPG tối đa 5MB</p>
          </>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-xs text-sky-600 font-medium">Đang upload...</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default AdminImagePicker;
