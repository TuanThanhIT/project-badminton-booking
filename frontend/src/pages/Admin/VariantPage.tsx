import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";

import type { ProductVariant } from "../../types/varient";
import productService from "../../services/admin/productService";
import IconButton from "../../components/ui/admin/IconButton";
import AddVariantModal from "../../components/ui/admin/AddVariantModal";
import EditVariantModal from "../../components/ui/admin/EditVariantModal";
import UploadImageModal from "../../components/ui/admin/UploadImageModal";
import EditImageModal from "../../components/ui/admin/EditImageModal";

import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Plus, ImagePlus } from "lucide-react";

export default function VariantPage() {
  const [searchParams] = useSearchParams();
  const productId = Number(searchParams.get("productId"));

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [openEditVariantModal, setOpenEditVariantModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openEditImageModal, setOpenEditImageModal] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<any>(null);

  /* ================== HANDLER ================== */
  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setOpenEditVariantModal(true);
  };

  const handleDeleteVariant = async (id: number) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Biến thể sau khi xóa sẽ không thể khôi phục!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#e3342f",
    });

    if (!result.isConfirmed) return;

    try {
      await productService.deleteVariantService(id);
      setVariants((prev) => prev.filter((v) => v.id !== id));
      Swal.fire("Đã xóa!", "Biến thể đã được xóa.", "success");
    } catch {
      Swal.fire("Lỗi!", "Không thể xóa biến thể.", "error");
    }
  };

  /* ================== TABLE ================== */
  const columns: ColumnsType<ProductVariant> = [
    {
      title: "SKU",
      dataIndex: "sku",
      align: "center",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Giá gốc",
      dataIndex: "price",
      align: "center",
      render: (p) => Number(p || 0).toLocaleString() + " đ",
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      align: "center",
      render: (d) => {
        const discount = Number(d || 0);
        const percent = discount <= 1 ? discount * 100 : discount;
        return <span className="text-blue-600">-{percent}%</span>;
      },
    },
    {
      title: "Giá sau giảm",
      align: "center",
      render: (_, v) => {
        const price = Number(v.price || 0);
        let discount = Number(v.discount || 0);
        if (discount <= 1) discount *= 100;
        const finalPrice = price - (price * discount) / 100;

        return (
          <span className="text-green-600 font-semibold">
            {finalPrice.toLocaleString()} đ
          </span>
        );
      },
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      align: "center",
      render: (s) => (
        <span
          className={
            Number(s) === 0 ? "text-red-600 font-semibold" : "font-medium"
          }
        >
          {s}
        </span>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      align: "center",
      render: (c) => c || "-",
    },
    {
      title: "Kích thước",
      dataIndex: "size",
      align: "center",
      render: (s) => s || "-",
    },
    {
      title: "Chất liệu",
      dataIndex: "material",
      align: "center",
      render: (m) => m || "-",
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, variant) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEditVariant(variant)}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
          >
            Sửa
          </button>
          <button
            onClick={() => handleDeleteVariant(variant.id)}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  /* ================== FETCH ================== */
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const res = await productService.getVariantsByProductIdService(
          productId
        );
        setVariants((res.data.data || []).filter((v) => v != null));
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, [productId]);

  const fetchImages = async () => {
    const res = await productService.getProductImagesService(productId);
    setImages(res.data.data || []);
  };

  useEffect(() => {
    fetchImages();
  }, [productId]);

  /* ================== UI ================== */
  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-sky-700">
            Quản lý biến thể sản phẩm
          </h2>
          <p className="text-sm text-gray-500">
            Danh sách các biến thể thuộc sản phẩm
          </p>
        </div>

        <div className="flex gap-3">
          <IconButton
            type="button"
            icon={ImagePlus}
            text="Thêm ảnh"
            color="bg-green-600"
            hoverColor="hover:bg-green-700"
            onClick={() => setOpenUploadModal(true)}
          />
          <IconButton
            type="button"
            icon={Plus}
            text="Thêm biến thể"
            color="bg-blue-600"
            hoverColor="hover:bg-blue-700"
            onClick={() => setOpenModal(true)}
          />
        </div>
        {/* TABLE */}
        <Table
          columns={columns}
          dataSource={variants}
          loading={loading}
          pagination={false}
          rowKey="id"
        />

        {/* IMAGE SECTION */}
        <h3 className="text-lg font-semibold mt-8 mb-3">Hình ảnh sản phẩm</h3>

        <div className="grid grid-cols-6 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="border rounded-lg p-2 flex flex-col items-center hover:shadow"
            >
              <img
                src={img.imageUrl}
                className="w-24 h-24 object-cover rounded border"
              />

              <div className="flex gap-2 mt-3">
                <button
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                  onClick={() => {
                    setSelectedImage(img);
                    setOpenEditImageModal(true);
                  }}
                >
                  Sửa
                </button>

                <button
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                  onClick={async () => {
                    await productService.deleteProductImageService(img.id);
                    toast.success("Đã xóa hình ảnh");
                    fetchImages();
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <AddVariantModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          productId={productId}
          onSuccess={async () => {
            const res = await productService.getVariantsByProductIdService(
              productId
            );
            setVariants((res.data.data || []).filter((v) => v != null));
            setOpenModal(false);
          }}
        />
      )}

      {openEditVariantModal && selectedVariant && (
        <EditVariantModal
          isOpen={openEditVariantModal}
          onClose={() => setOpenEditVariantModal(false)}
          variantId={selectedVariant.id}
          onSuccess={async () => {
            const res = await productService.getVariantsByProductIdService(
              productId
            );
            setVariants(res.data.data || []);
            setOpenEditVariantModal(false);
          }}
        />
      )}

      {openUploadModal && (
        <UploadImageModal
          isOpen={openUploadModal}
          onClose={() => setOpenUploadModal(false)}
          productId={productId}
        />
      )}

      {openEditImageModal && selectedImage && (
        <EditImageModal
          isOpen={openEditImageModal}
          onClose={() => setOpenEditImageModal(false)}
          imageId={selectedImage.id}
          currentUrl={selectedImage.imageUrl}
          onSuccess={fetchImages}
        />
      )}
    </div>
  );
}
