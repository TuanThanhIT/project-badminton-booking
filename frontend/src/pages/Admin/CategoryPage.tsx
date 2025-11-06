import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, ArrowUpDown } from "lucide-react";

interface Category {
  id: number;
  image: string;
  cateName: string;
  menuGroup: string;
  createdDate: string;
  updatedDate: string;
}

const CategoryPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const pageSize = 5;

  const data: Category[] = [
    {
      id: 1,
      image: "https://placehold.co/60x60",
      cateName: "Bag",
      menuGroup: "Fashion",
      createdDate: "2024-08-01",
      updatedDate: "2024-09-10",
    },
    {
      id: 2,
      image: "https://placehold.co/60x60",
      cateName: "Sneakers",
      menuGroup: "Shoes",
      createdDate: "2024-07-15",
      updatedDate: "2024-08-22",
    },
    {
      id: 3,
      image: "https://placehold.co/60x60",
      cateName: "Watch",
      menuGroup: "Accessories",
      createdDate: "2024-06-20",
      updatedDate: "2024-07-25",
    },
    {
      id: 4,
      image: "https://placehold.co/60x60",
      cateName: "Hat",
      menuGroup: "Fashion",
      createdDate: "2024-05-11",
      updatedDate: "2024-06-02",
    },
    {
      id: 5,
      image: "https://placehold.co/60x60",
      cateName: "Sunglasses",
      menuGroup: "Accessories",
      createdDate: "2024-04-10",
      updatedDate: "2024-05-05",
    },
    {
      id: 6,
      image: "https://placehold.co/60x60",
      cateName: "Chair",
      menuGroup: "Home",
      createdDate: "2024-03-18",
      updatedDate: "2024-04-01",
    },
  ];

  // 🔍 Lọc dữ liệu theo từ khóa
  let filteredData = data.filter((item) =>
    item.cateName.toLowerCase().includes(search.toLowerCase())
  );

  // 🔽 Sắp xếp theo tên nếu được bật
  if (sortOrder) {
    filteredData = [...filteredData].sort((a, b) =>
      sortOrder === "asc"
        ? a.cateName.localeCompare(b.cateName)
        : b.cateName.localeCompare(a.cateName)
    );
  }

  // 📄 Phân trang
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // 🔁 Toggle sắp xếp
  const toggleSort = () => {
    if (sortOrder === "asc") setSortOrder("desc");
    else if (sortOrder === "desc") setSortOrder(null);
    else setSortOrder("asc");
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white w-80 shadow-sm">
          <Search className="text-gray-400 mr-2" size={16} />
          <input
            type="text"
            placeholder="Search by category name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full outline-none text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold border-b border-white">
            <tr>
              <th className="p-3">Image</th>
              <th
                className="p-3 cursor-pointer select-none"
                onClick={toggleSort}
              >
                <div className="flex items-center gap-1">
                  Category Name
                  <ArrowUpDown
                    size={14}
                    className={`transition ${
                      sortOrder
                        ? sortOrder === "asc"
                          ? "text-blue-500 rotate-180"
                          : "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              </th>
              <th className="p-3">Menu Group</th>
              <th className="p-3">Created Date</th>
              <th className="p-3">Updated Date</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    <img
                      src={item.image}
                      alt={item.cateName}
                      className="w-14 h-14 object-cover rounded-md border"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {item.cateName}
                  </td>
                  <td className="p-3 text-gray-700">{item.menuGroup}</td>
                  <td className="p-3 text-gray-500">{item.createdDate}</td>
                  <td className="p-3 text-gray-500">{item.updatedDate}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition">
                      <Pencil size={16} />
                    </button>
                    <button className="p-2 bg-red-100 hover:bg-red-200 rounded-md text-red-600 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-3 py-1 border rounded-md ${
            page === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "hover:bg-gray-100 border-gray-300"
          }`}
        >
          ‹
        </button>
        <span className="px-3 py-1 border border-gray-300 rounded-md bg-blue-50 text-blue-600 font-medium">
          {page}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-3 py-1 border rounded-md ${
            page === totalPages
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "hover:bg-gray-100 border-gray-300"
          }`}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default CategoryPage;
