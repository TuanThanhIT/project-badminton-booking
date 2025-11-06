import React, { useState } from "react";
import { Save, X, ImagePlus, Tag, Package2, List, Layers3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ProductData = {
  productName: string;
  brand: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
  images: string[];
  sku: string;
  price: string;
  stock: string;
  discount: string;
  color: string;
  size: string;
  material: string;
};

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [formData, setFormData] = useState<ProductData>({
    productName: "",
    brand: "",
    description: "",
    thumbnailUrl: "",
    categoryId: "",
    images: [],
    sku: "",
    price: "",
    stock: "",
    discount: "",
    color: "",
    size: "",
    material: "",
  });
  const categories = [
    { id: 1, name: "Shoes" },
    { id: 2, name: "Clothes" },
    { id: 3, name: "Accessories" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setFormData({ ...formData, images: [...formData.images, ...newImages] });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Mock saved product:", formData);
    alert("✅ Product added successfully (mock)!");
  };
  const handleCancel = () => {
    setFormData({
      productName: "",
      brand: "",
      description: "",
      thumbnailUrl: "",
      categoryId: "",
      images: [],
      sku: "",
      price: "",
      stock: "",
      discount: "",
      color: "",
      size: "",
      material: "",
    });
    navigate("/admin/products");
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package2 className="text-blue-500" /> Add New Product
          </h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              <X size={16} /> Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              <Save size={16} /> Save Product
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {[
            { id: "summary", label: "Summary", icon: <List size={16} /> },
            {
              id: "images",
              label: "Images & Gallery",
              icon: <ImagePlus size={16} />,
            },
            {
              id: "pricing",
              label: "Pricing & Inventory",
              icon: <Tag size={16} />,
            },
            {
              id: "variant",
              label: "Variant Options",
              icon: <Layers3 size={16} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "summary" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Enter brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="Enter product description"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Category Name
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === "images" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>

              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="text-gray-500">Click to upload images</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {formData.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {formData.images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`product-${i}`}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="e.g. 10 for 10%"
                />
              </div>
            </div>
          )}

          {activeTab === "variant" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="e.g. Red, Blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="e.g. M, L, XL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="e.g. Cotton, Plastic"
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
