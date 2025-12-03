import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { ProductVariant } from "../../../src/types/varient";
import { getVariantsByProductIdService } from "../../../src/services/admin/productService";
import IconButton from "../../components/commons/admin/IconButton";
import VariantModal from "../../components/commons/admin/VariantModal";
import { Plus } from "lucide-react";
export default function VariantPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const productId = Number(searchParams.get("productId")); // lấy productId từ URL

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const handleEdit = (variant: ProductVariant) => {
    navigate(`/admin/variants/edit/${variant.id}`);
  };

  const handleAddVariant = () => {
    setOpenModal(true);
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
        const price = Number(v.price || 0);
        let discount = Number(v.discount || 0);

        // convert 0.2 → 20%
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
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getVariantsByProductIdService(productId);
        setVariants(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Product Variants</h2>
        <IconButton
          type="button"
          icon={Plus}
          text="Thêm biến thể"
          color="bg-blue-500"
          hoverColor="hover:bg-blue-700"
          onClick={handleAddVariant}
        />
        {openModal && (
          <div className="z-80">
            <VariantModal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              productId={productId}
              onSuccess={(newVariant) => {
                setVariants((prev) => [...prev, newVariant]);
                setOpenModal(false);
              }}
            />
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={variants}
        loading={loading}
        pagination={false}
        rowKey="id"
        rowClassName={() => "text-center"}
      />
    </div>
  );
}
