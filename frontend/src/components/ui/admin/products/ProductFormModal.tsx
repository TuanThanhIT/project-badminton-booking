import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Eye, FileCode2, ImagePlus, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminProductService, {
  type ProductVariantPayload,
} from "../../../../services/admin/productService";
import type {
  AdminCategory,
  AdminProduct,
  AdminProductImage,
  AdminProductVariant,
} from "../../../../types/admin";
import AdminImagePicker from "../AdminImagePicker";
import {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextAreaClass,
} from "../AdminModal";
import AdminModal from "../AdminModal";
import { AdminProductFormSchema } from "../../../../schemas/AdminFormSchemas";

type ProductFormModalProps = {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
};

type DetailImageDraft = {
  key: string;
  id?: number;
  imageUrl: string;
};

type VariantDraft = {
  key: string;
  id?: number;
  sku: string;
  price: number;
  discount: number;
  color: string;
  size: string;
  material: string;
  weight: number;
};

const createDraftKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const createEmptyVariant = (variant?: AdminProductVariant): VariantDraft => ({
  key: createDraftKey(),
  id: variant?.id,
  sku: variant?.sku || "",
  price: Number(variant?.price || 0),
  discount: Number(variant?.discount || 0),
  color: variant?.color || "",
  size: variant?.size || "",
  material: variant?.material || "",
  weight: Number(variant?.weight || 0.5),
});

const createDetailImageDraft = (imageUrl = "", id?: number): DetailImageDraft => ({
  key: createDraftKey(),
  id,
  imageUrl,
});

const hasUsefulVariantInfo = (variant: VariantDraft) =>
  variant.sku.trim() ||
  variant.color.trim() ||
  variant.size.trim() ||
  variant.material.trim() ||
  Number(variant.price) > 0;

const toVariantPayload = (variant: VariantDraft): ProductVariantPayload => ({
  sku: variant.sku.trim(),
  price: Number(variant.price || 0),
  discount: Number(variant.discount || 0),
  color: variant.color.trim(),
  size: variant.size.trim(),
  material: variant.material.trim(),
  weight: Number(variant.weight || 0.5),
});

const ProductFormModal = ({
  product,
  categories,
  onClose,
  onSaved,
}: ProductFormModalProps) => {
  const isEdit = !!product;
  const [form, setForm] = useState({
    productName: product?.productName || "",
    brand: product?.brand || "",
    description: product?.description || "",
    thumbnailUrl: product?.thumbnailUrl || "",
    categoryId: product?.categoryId || categories[0]?.id || 0,
  });
  const [detailImages, setDetailImages] = useState<DetailImageDraft[]>([]);
  const [newDetailImageUrl, setNewDetailImageUrl] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([createEmptyVariant()]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);
  const [previewDescription, setPreviewDescription] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit || !product) {
      setDetailImages([]);
      setVariants([createEmptyVariant()]);
      setDeletedImageIds([]);
      setDeletedVariantIds([]);
      return;
    }

    let active = true;
    setLoadingDetail(true);
    adminProductService
      .getProductDetailService(product.id)
      .then((res) => {
        if (!active) return;
        const data = (res.data as any).data as AdminProduct;
        setForm({
          productName: data.productName || "",
          brand: data.brand || "",
          description: data.description || "",
          thumbnailUrl: data.thumbnailUrl || "",
          categoryId: data.categoryId || categories[0]?.id || 0,
        });
        setDetailImages(
          (data.images || []).map((image: AdminProductImage) =>
            createDetailImageDraft(image.imageUrl, image.id),
          ),
        );
        setVariants(
          (data.variants || []).length
            ? (data.variants || []).map((variant: AdminProductVariant) =>
                createEmptyVariant(variant),
              )
            : [createEmptyVariant()],
        );
        setDeletedImageIds([]);
        setDeletedVariantIds([]);
      })
      .catch(() => toast.error("Không thể tải chi tiết sản phẩm"))
      .finally(() => {
        if (active) setLoadingDetail(false);
      });

    return () => {
      active = false;
    };
  }, [categories, isEdit, product]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        label: `${category.menuGroup ? `${category.menuGroup} / ` : ""}${category.cateName}`,
      })),
    [categories],
  );

  const updateVariant = (key: string, patch: Partial<VariantDraft>) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.key === key ? { ...variant, ...patch } : variant,
      ),
    );
  };

  const updateDetailImage = (key: string, imageUrl: string) => {
    setDetailImages((prev) =>
      prev.map((image) => (image.key === key ? { ...image, imageUrl } : image)),
    );
  };

  const addDetailImage = () => {
    const url = newDetailImageUrl.trim();
    if (!url) return;
    setDetailImages((prev) => [...prev, createDetailImageDraft(url)]);
    setNewDetailImageUrl("");
  };

  const removeDetailImage = (image: DetailImageDraft) => {
    if (image.id) setDeletedImageIds((prev) => [...prev, image.id as number]);
    setDetailImages((prev) => prev.filter((item) => item.key !== image.key));
  };

  const removeVariant = (variant: VariantDraft) => {
    if (variant.id) setDeletedVariantIds((prev) => [...prev, variant.id as number]);
    setVariants((prev) => prev.filter((item) => item.key !== variant.key));
  };

  const syncEditableDetails = async () => {
    if (!product) return;

    await Promise.all([
      ...deletedImageIds.map((imageId) =>
        adminProductService.deleteProductImageService(imageId),
      ),
      ...deletedVariantIds.map((variantId) =>
        adminProductService.deleteProductVariantService(variantId),
      ),
    ]);

    const existingImages = detailImages.filter(
      (image) => image.id && image.imageUrl.trim(),
    );
    const newImages = detailImages
      .filter((image) => !image.id && image.imageUrl.trim())
      .map((image) => image.imageUrl.trim());

    await Promise.all(
      existingImages.map((image) =>
        adminProductService.updateProductImageService(
          image.id as number,
          image.imageUrl.trim(),
        ),
      ),
    );

    if (newImages.length) {
      await adminProductService.addProductImagesService(product.id, newImages);
    }

    const usefulVariants = variants.filter(
      (variant) => variant.id || hasUsefulVariantInfo(variant),
    );
    await Promise.all(
      usefulVariants.map((variant) =>
        variant.id
          ? adminProductService.updateProductVariantService(
              variant.id,
              toVariantPayload(variant),
            )
          : adminProductService.createProductVariantService(
              product.id,
              toVariantPayload(variant),
            ),
      ),
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = AdminProductFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }

    const variantPayload = variants
      .filter(hasUsefulVariantInfo)
      .map(toVariantPayload);
    if (variantPayload.some((variant) => Number(variant.price) < 0)) {
      toast.error("Giá biến thể không hợp lệ");
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      if (isEdit && product) {
        await adminProductService.updateProductService(product.id, parsed.data);
        await syncEditableDetails();
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await adminProductService.createProductService({
          ...parsed.data,
          imageUrls: detailImages
            .map((image) => image.imageUrl.trim())
            .filter(Boolean),
          variants: variantPayload,
        });
        toast.success("Đã tạo sản phẩm");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      description={
        isEdit
          ? "Cập nhật thông tin, ảnh chi tiết và biến thể sản phẩm."
          : "Tạo sản phẩm kèm biến thể và hình ảnh chi tiết."
      }
      icon={<Package className="h-5 w-5 text-sky-600" />}
      onClose={onClose}
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <AdminImagePicker
            value={form.thumbnailUrl}
            onChange={(url) => {
              setForm({ ...form, thumbnailUrl: url });
              setErrors({ ...errors, thumbnailUrl: "" });
            }}
            label="Ảnh đại diện *"
            height="h-56"
          />

          <div className="space-y-4">
            <AdminField label="Tên sản phẩm" error={errors.productName}>
              <input
                value={form.productName}
                onChange={(event) => {
                  setForm({ ...form, productName: event.target.value });
                  setErrors({ ...errors, productName: "" });
                }}
                className={`w-full ${adminInputClass}`}
                placeholder="Nhập tên sản phẩm, ví dụ: Vợt Yonex Astrox 88D Pro"
              />
            </AdminField>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Thương hiệu" error={errors.brand}>
                <input
                  value={form.brand}
                  onChange={(event) => {
                    setForm({ ...form, brand: event.target.value });
                    setErrors({ ...errors, brand: "" });
                  }}
                  className={`w-full ${adminInputClass}`}
                  placeholder="Nhập thương hiệu, ví dụ: Yonex, Lining"
                />
              </AdminField>

              <AdminField label="Danh mục" error={errors.categoryId}>
                <select
                  value={form.categoryId}
                  onChange={(event) => {
                    setForm({ ...form, categoryId: Number(event.target.value) });
                    setErrors({ ...errors, categoryId: "" });
                  }}
                  className={`w-full ${adminInputClass}`}
                >
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Mô tả
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Có thể nhập HTML kèm text để hiển thị đẹp hơn ở trang chi tiết.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewDescription((prev) => !prev)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {previewDescription ? (
                <FileCode2 className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {previewDescription ? "Soạn HTML" : "Xem trước"}
            </button>
          </div>

          {previewDescription ? (
            <div
              className="min-h-[260px] w-full overflow-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 [&_a]:text-sky-600 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_strong]:font-bold [&_ul]:list-disc"
              dangerouslySetInnerHTML={{
                __html:
                  form.description.trim() ||
                  "<p class='text-slate-400'>Chưa có nội dung mô tả để xem trước.</p>",
              }}
            />
          ) : (
            <textarea
              value={form.description}
              onChange={(event) => {
                setForm({ ...form, description: event.target.value });
                setErrors({ ...errors, description: "" });
              }}
              rows={12}
              className={`min-h-[260px] w-full resize-y ${adminTextAreaClass}`}
              placeholder="Nhập mô tả bằng text hoặc HTML, ví dụ: <h2>Điểm nổi bật</h2><ul><li>Khung carbon nhẹ</li><li>Phù hợp người chơi tấn công</li></ul>"
            />
          )}
          {errors.description ? (
            <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
          ) : null}
        </div>

        {loadingDetail ? (
          <div className="flex justify-center rounded-xl border border-slate-200 py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <section className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Hình ảnh chi tiết
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Các ảnh này hiển thị trong trang chi tiết sản phẩm.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {detailImages.map((image) => (
                  <div key={image.key} className="relative">
                    <AdminImagePicker
                      value={image.imageUrl}
                      onChange={(url) => updateDetailImage(image.key, url)}
                      label={image.id ? "Ảnh chi tiết hiện có" : "Ảnh chi tiết mới"}
                      height="h-28"
                    />
                    <button
                      type="button"
                      onClick={() => removeDetailImage(image)}
                      className="absolute right-2 top-7 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 shadow-sm hover:bg-red-50"
                      aria-label="Xóa ảnh chi tiết"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <AdminImagePicker
                  key={`new-detail-image-${detailImages.length}`}
                  value={newDetailImageUrl}
                  onChange={setNewDetailImageUrl}
                  label="Thêm ảnh chi tiết"
                  height="h-28"
                />
                <button
                  type="button"
                  onClick={addDetailImage}
                  disabled={!newDetailImageUrl.trim()}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                >
                  <ImagePlus className="h-4 w-4" />
                  Thêm ảnh
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Biến thể sản phẩm
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Chỉ nhập thông tin biến thể. Số lượng tồn kho quản lý ở trang Tồn kho.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVariants((prev) => [...prev, createEmptyVariant()])}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                >
                  <Plus className="h-4 w-4" />
                  Thêm biến thể
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={variant.key} className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        Biến thể #{index + 1}
                      </p>
                      {isEdit || variants.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeVariant(variant)}
                          className="text-xs font-semibold text-red-500 hover:text-red-600"
                        >
                          Xóa
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <AdminField label="Mã SKU">
                        <input
                          value={variant.sku}
                          onChange={(event) =>
                            updateVariant(variant.key, { sku: event.target.value })
                          }
                          className={`w-full ${adminInputClass}`}
                          placeholder="Nhập mã SKU, ví dụ: ASTROX88D-4U-G5"
                        />
                      </AdminField>
                      <AdminField label="Giá bán">
                        <input
                          type="number"
                          min={0}
                          value={variant.price}
                          onChange={(event) =>
                            updateVariant(variant.key, { price: Number(event.target.value) })
                          }
                          className={`w-full ${adminInputClass}`}
                          placeholder="Nhập giá bán"
                        />
                      </AdminField>
                      <AdminField label="Giảm giá (%)">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={variant.discount}
                          onChange={(event) =>
                            updateVariant(variant.key, { discount: Number(event.target.value) })
                          }
                          className={`w-full ${adminInputClass}`}
                          placeholder="Nhập % giảm giá"
                        />
                      </AdminField>
                      <AdminField label="Khối lượng (kg)">
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={variant.weight}
                          onChange={(event) =>
                            updateVariant(variant.key, { weight: Number(event.target.value) })
                          }
                          className={`w-full ${adminInputClass}`}
                          placeholder="Nhập khối lượng, ví dụ: 0.5"
                        />
                      </AdminField>
                      <AdminField label="Kích thước">
                        <input
                          value={variant.size}
                          onChange={(event) =>
                            updateVariant(variant.key, { size: event.target.value })
                          }
                          className={`w-full ${adminInputClass}`}
                          placeholder="Nhập size, ví dụ: 4U, 5U, M, L"
                        />
                      </AdminField>
                      <AdminField label="Màu sắc">
                        <input
                          value={variant.color}
                          onChange={(event) =>
                            updateVariant(variant.key, { color: event.target.value })
                          }
                          className={`w-full ${adminInputClass}`}
                          placeholder="Nhập màu, ví dụ: Đen/Vàng"
                        />
                      </AdminField>
                      <AdminField label="Chất liệu" className="md:col-span-2">
                        <input
                          value={variant.material}
                          onChange={(event) =>
                            updateVariant(variant.key, { material: event.target.value })
                          }
                          className={`w-full ${adminInputClass}`}
                          placeholder="Nhập chất liệu, ví dụ: Graphite, Carbon"
                        />
                      </AdminField>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button type="button" onClick={onClose} className={adminSecondaryButtonClass}>
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving || loadingDetail}
            className={adminPrimaryButtonClass}
          >
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default ProductFormModal;
