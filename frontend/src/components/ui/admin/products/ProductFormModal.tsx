import { useEffect, useState, type FormEvent } from "react";
import { Edit2, ImagePlus, Package, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import adminProductService, { type ProductVariantPayload } from "../../../../services/admin/productService";
import type {
  AdminCategory,
  AdminProduct,
  AdminProductImage,
  AdminProductVariant,
  AdminStockBranch,
} from "../../../../types/admin";
import AdminImagePicker from "../AdminImagePicker";

type ProductFormModalProps = {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
};

type VariantForm = {
  id?: number;
  sku: string;
  price: number;
  discount: number;
  color: string;
  size: string;
  material: string;
  weight: number;
};

const emptyVariant: VariantForm = {
  sku: "",
  price: 0,
  discount: 0,
  color: "",
  size: "",
  material: "",
  weight: 0.5,
};

const fmtCurrency = (value: number) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const ProductFormModal = ({ product, categories, onClose, onSaved }: ProductFormModalProps) => {
  const isEdit = !!product;
  const [form, setForm] = useState({
    productName: product?.productName || "",
    brand: product?.brand || "",
    description: product?.description || "",
    thumbnailUrl: product?.thumbnailUrl || "",
    categoryId: product?.categoryId || (categories[0]?.id || 0),
  });

  const [saving, setSaving] = useState(false);
  const [previewDesc, setPreviewDesc] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);
  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageSaving, setImageSaving] = useState(false);

  const [branches, setBranches] = useState<AdminStockBranch[]>([]);
  const [variants, setVariants] = useState<AdminProductVariant[]>([]);
  const [variantForm, setVariantForm] = useState<VariantForm>(emptyVariant);
  const [stockForm, setStockForm] = useState<Record<number, number>>({});
  const [variantSaving, setVariantSaving] = useState(false);

  const fetchDetail = async () => {
    if (!product) return;
    setDetailLoading(true);
    try {
      const [detailRes, branchRes] = await Promise.all([
        adminProductService.getProductDetailService(product.id),
        adminProductService.getStockBranchesService(),
      ]);
      const detail = (detailRes.data as any).data;
      setImages(detail.images || []);
      setVariants(detail.variants || []);
      setBranches((branchRes.data as any).data || []);
    } catch {
      toast.error("Không thể tải chi tiết sản phẩm");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [product?.id]);

  const resetVariantForm = () => {
    setVariantForm(emptyVariant);
    setStockForm({});
  };

  const editVariant = (variant: AdminProductVariant) => {
    setVariantForm({
      id: variant.id,
      sku: variant.sku || "",
      price: Number(variant.price || 0),
      discount: Number(variant.discount || 0),
      color: variant.color || "",
      size: variant.size || "",
      material: variant.material || "",
      weight: Number(variant.weight || 0.5),
    });

    const nextStock: Record<number, number> = {};
    variant.stocks?.forEach((stock) => {
      nextStock[stock.branchId] = Number(stock.stock || 0);
    });
    setStockForm(nextStock);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.brand.trim() || !form.description.trim() || !form.thumbnailUrl.trim() || !form.categoryId) {
      toast.error("Vui lòng điền đầy đủ thông tin và chọn ảnh");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await adminProductService.updateProductService(product!.id, form);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await adminProductService.createProductService(form);
        toast.success("Đã tạo sản phẩm");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!product || !newImageUrl.trim()) return;
    setImageSaving(true);
    try {
      await adminProductService.addProductImagesService(product.id, [newImageUrl]);
      setNewImageUrl("");
      toast.success("Đã thêm hình ảnh");
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể thêm hình ảnh");
    } finally {
      setImageSaving(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    setImageSaving(true);
    try {
      await adminProductService.deleteProductImageService(imageId);
      toast.success("Đã xóa hình ảnh");
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xóa hình ảnh");
    } finally {
      setImageSaving(false);
    }
  };

  const handleSaveVariant = async () => {
    if (!product) return;
    if (Number(variantForm.price) < 0) {
      toast.error("Giá biến thể không hợp lệ");
      return;
    }

    const payload: ProductVariantPayload = {
      sku: variantForm.sku.trim(),
      price: Number(variantForm.price || 0),
      discount: Number(variantForm.discount || 0),
      color: variantForm.color.trim(),
      size: variantForm.size.trim(),
      material: variantForm.material.trim(),
      weight: Number(variantForm.weight || 0.5),
      stocks: branches.map((branch) => ({
        branchId: branch.id,
        stock: Math.max(0, Number(stockForm[branch.id] || 0)),
      })),
    };

    setVariantSaving(true);
    try {
      if (variantForm.id) {
        await adminProductService.updateProductVariantService(variantForm.id, payload);
        toast.success("Đã cập nhật biến thể");
      } else {
        await adminProductService.createProductVariantService(product.id, payload);
        toast.success("Đã thêm biến thể");
      }
      resetVariantForm();
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể lưu biến thể");
    } finally {
      setVariantSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    setVariantSaving(true);
    try {
      await adminProductService.deleteProductVariantService(variantId);
      toast.success("Đã xóa biến thể");
      if (variantForm.id === variantId) resetVariantForm();
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xóa biến thể");
    } finally {
      setVariantSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-gray-800">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminImagePicker value={form.thumbnailUrl} onChange={(url) => setForm({ ...form, thumbnailUrl: url })} label="Ảnh đại diện *" height="h-36" />

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tên sản phẩm *</label>
              <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Tên sản phẩm..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Thương hiệu *</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Brand..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục *</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.cateName}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Mô tả *</label>
                {form.description && (
                  <button type="button" onClick={() => setPreviewDesc(!previewDesc)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium transition">
                    {previewDesc ? "Chỉnh sửa" : "Xem trước"}
                  </button>
                )}
              </div>
              {previewDesc ? (
                <div
                  className="w-full min-h-[80px] max-h-[220px] overflow-y-auto px-3 py-2 rounded-lg border border-sky-200 bg-sky-50/30 text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: form.description }}
                />
              ) : (
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 resize-none font-mono" placeholder="Mô tả sản phẩm..." />
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">Hủy</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition disabled:opacity-60">
                {saving ? "Đang lưu..." : isEdit ? "Cập nhật thông tin" : "Tạo mới"}
              </button>
            </div>
          </form>

          {isEdit && (
            <div className="border-t border-gray-100 pt-6 space-y-6">
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">Hình ảnh chi tiết</h3>
                        <p className="text-xs text-gray-400">Các ảnh này hiển thị trong trang chi tiết sản phẩm.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((image) => (
                        <div key={image.id} className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={image.imageUrl} alt="product" className="w-full h-28 object-cover" />
                          <button type="button" disabled={imageSaving} onClick={() => handleDeleteImage(image.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-red-500 hover:bg-red-50 flex items-center justify-center shadow-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {images.length === 0 && (
                        <div className="col-span-full py-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                          Chưa có hình ảnh chi tiết
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <AdminImagePicker value={newImageUrl} onChange={setNewImageUrl} label="Thêm hình ảnh" height="h-28" />
                      <button type="button" disabled={!newImageUrl || imageSaving} onClick={handleAddImage}
                        className="h-10 px-4 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 disabled:opacity-60 inline-flex items-center justify-center gap-2">
                        <ImagePlus className="w-4 h-4" /> Thêm ảnh
                      </button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Biến thể sản phẩm</h3>
                      <p className="text-xs text-gray-400">Quản lý giá, phân loại và tồn kho theo từng chi nhánh.</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      {variants.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">Chưa có biến thể</div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                              {["SKU", "Phân loại", "Giá", "Giảm", "Tồn kho", ""].map((header) => (
                                <th key={header} className="px-3 py-2 text-left font-semibold">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {variants.map((variant) => {
                              const totalStock = variant.stocks?.reduce((sum, stock) => sum + Number(stock.stock || 0), 0) || 0;
                              return (
                                <tr key={variant.id}>
                                  <td className="px-3 py-2 text-gray-600">{variant.sku || "-"}</td>
                                  <td className="px-3 py-2">
                                    <p className="font-semibold text-gray-800">{[variant.size, variant.color].filter(Boolean).join(" / ") || "Mặc định"}</p>
                                    <p className="text-xs text-gray-400">{variant.material || "-"} · {variant.weight || 0}kg</p>
                                  </td>
                                  <td className="px-3 py-2 font-semibold text-sky-700">{fmtCurrency(variant.price)}</td>
                                  <td className="px-3 py-2 text-gray-600">{variant.discount || 0}%</td>
                                  <td className="px-3 py-2 text-gray-600">{totalStock}</td>
                                  <td className="px-3 py-2">
                                    <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => editVariant(variant)}
                                        className="px-2 py-1 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 text-xs inline-flex items-center gap-1">
                                        <Edit2 className="w-3 h-3" /> Sửa
                                      </button>
                                      <button type="button" disabled={variantSaving} onClick={() => handleDeleteVariant(variant.id)}
                                        className="px-2 py-1 rounded-lg bg-red-50 text-red-500 border border-red-200 text-xs inline-flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Xóa
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div className="rounded-xl border border-sky-100 bg-sky-50/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">{variantForm.id ? "Cập nhật biến thể" : "Thêm biến thể mới"}</p>
                        {variantForm.id && (
                          <button type="button" onClick={resetVariantForm} className="text-xs text-gray-500 hover:text-gray-700">Hủy sửa</button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <input value={variantForm.sku} onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="SKU" />
                        <input type="number" min={0} value={variantForm.price} onChange={(e) => setVariantForm({ ...variantForm, price: Number(e.target.value) })}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Giá" />
                        <input type="number" min={0} max={100} value={variantForm.discount} onChange={(e) => setVariantForm({ ...variantForm, discount: Number(e.target.value) })}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Giảm %" />
                        <input type="number" min={0} step={0.1} value={variantForm.weight} onChange={(e) => setVariantForm({ ...variantForm, weight: Number(e.target.value) })}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Khối lượng" />
                        <input value={variantForm.size} onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Size" />
                        <input value={variantForm.color} onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Màu" />
                        <input value={variantForm.material} onChange={(e) => setVariantForm({ ...variantForm, material: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 md:col-span-2" placeholder="Chất liệu" />
                      </div>

                      {branches.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {branches.map((branch) => (
                            <div key={branch.id}>
                              <label className="block text-xs font-medium text-gray-600 mb-1">{branch.branchName}</label>
                              <input type="number" min={0} value={stockForm[branch.id] || 0}
                                onChange={(e) => setStockForm({ ...stockForm, [branch.id]: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
                            </div>
                          ))}
                        </div>
                      )}

                      <button type="button" disabled={variantSaving} onClick={handleSaveVariant}
                        className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 disabled:opacity-60 inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {variantForm.id ? "Lưu biến thể" : "Thêm biến thể"}
                      </button>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
