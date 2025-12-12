import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { ProductVariant } from "../../../src/types/varient";
import productService from "../../services/admin/productService";
import IconButton from "../../components/commons/admin/IconButton";
import AddVariantModal from "../../components/commons/admin/AddVariantModal";
import EditVariantModal from "../../components/commons/admin/EditVariantModal";
import { toast } from "react-toastify";
import UploadImageModal from "../../components/commons/admin/UploadImageModal";
import { ImagePlus } from "lucide-react";
import Swal from "sweetalert2";
import EditImageModal from "../../components/commons/admin/EditImageModal";

import { Plus } from "lucide-react";
export default function VariantPage() {
  const [searchParams] = useSearchParams();

  const productId = Number(searchParams.get("productId")); // lấy productId từ URL

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [openEditVariantModal, setOpenEditVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  const [openEditImageModal, setOpenEditImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const handleEdit = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setOpenEditVariantModal(true);
  };

  const handleAddVariant = () => {
    setOpenModal(true);
  };
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Xóa biến thể này sẽ không thể khôi phục!",
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
      Swal.fire("Đã xóa!", "Biến thể đã bị xóa.", "success");
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể xóa biến thể.", "error");
    }
  };

  const columns: ColumnsType<ProductVariant> = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      align: "center",
      render: (text) => <span className="font-medium">{text}</span>,
    },

    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (p) => {
        const price = Number(p || 0);
        return <span>{price.toLocaleString()} đ</span>;
      },
    },

    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      align: "center",
      render: (d) => {
        const discount = Number(d || 0);
        // Nếu backend trả "0.2" → 20%
        const discountPercent = discount <= 1 ? discount * 100 : discount;

        return <span className="text-blue-500">-{discountPercent}%</span>;
      },
    },

    {
      title: "Final Price",
      key: "discountPrice",
      align: "center",
      render: (_, v) => {
        const price = Number(v?.price ?? 0);
        let discount = Number(v?.discount ?? 0);

        if (discount <= 1) discount = discount * 100;

        const finalPrice = price - (price * discount) / 100;

        return (
          <span className="text-green-600 font-semibold">
            {finalPrice.toLocaleString()} đ
          </span>
        );
      },
    },

    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      render: (s) => {
        const stock = Number(s || 0);
        return (
          <span className={stock === 0 ? "text-red-500 font-semibold" : ""}>
            {stock}
          </span>
        );
      },
    },

    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      align: "center",
      render: (c) => <span>{c ?? "-"}</span>,
    },

    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      align: "center",
      render: (s) => <span>{s ?? "-"}</span>,
    },

    {
      title: "Material",
      dataIndex: "material",
      key: "material",
      align: "center",
      render: (m) => <span>{m ?? "-"}</span>,
    },

    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, variant) => (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleEdit(variant)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(variant.id)}
            className="px-3 py-1 bg-red-500 text-white rounded-md"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await productService.getVariantsByProductIdService(
          productId
        );
        const cleanData = (res.data.data || []).filter((v) => v != null);
        setVariants(cleanData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);
  const fetchImages = async () => {
    const res = await productService.getProductImagesService(productId);
    setImages(res.data.data || []);
  };

  useEffect(() => {
    fetchImages();
  }, [productId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Product Variants</h2>

        {openModal && (
          <div className="z-80">
            <AddVariantModal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              productId={productId}
              onSuccess={async () => {
                const res = await productService.getVariantsByProductIdService(
                  productId
                );
                const cleanData = (res.data.data || []).filter(
                  (v) => v != null
                );
                setVariants(cleanData);
                setOpenModal(false);
              }}
            />
          </div>
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
          <div className="z-80">
            <UploadImageModal
              isOpen={openUploadModal}
              onClose={() => setOpenUploadModal(false)}
              productId={productId}
            />
          </div>
        )}
        {openEditImageModal && selectedImage && (
          <div className="z-80">
            <EditImageModal
              isOpen={openEditImageModal}
              onClose={() => setOpenEditImageModal(false)}
              imageId={selectedImage.id}
              currentUrl={selectedImage.imageUrl}
              onSuccess={fetchImages}
            />
          </div>
        )}

        <div className="flex gap-3">
          <IconButton
            type="button"
            icon={ImagePlus}
            text="Thêm ảnh"
            color="bg-green-500"
            hoverColor="hover:bg-green-700"
            onClick={() => setOpenUploadModal(true)}
          />

          <IconButton
            type="button"
            icon={Plus}
            text="Thêm biến thể"
            color="bg-blue-500"
            hoverColor="hover:bg-blue-700"
            onClick={handleAddVariant}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={variants}
        loading={loading}
        pagination={false}
        rowKey="id"
        rowClassName={() => "text-center"}
      />
      <h3 className="font-semibold text-md mb-2 mt-6">Product Images</h3>

      <div className="grid grid-cols-6 gap-4 mb-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="flex flex-col items-center border p-2 rounded"
          >
            <img
              src={img.imageUrl}
              className="w-24 h-24 object-cover rounded border"
            />

            <div className="flex gap-2 mt-2">
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => {
                  setSelectedImage(img);
                  setOpenEditImageModal(true);
                }}
              >
                Edit
              </button>

              <button
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={async () => {
                  await productService.deleteProductImageService(img.id);
                  toast.success("Đã xóa ảnh");
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
  );
}
