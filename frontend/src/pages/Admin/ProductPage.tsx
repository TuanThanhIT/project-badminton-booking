import React from "react";
import { Table, Tag, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Line, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Plus, Gift, Banknote, LineChart } from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);
interface ProductData {
  key: string;
  product: string;
  sku: string;
  stock: number;
  price: string;
  rating: number;
  status: string;
}
const columns: ColumnsType<ProductData> = [
  {
    title: "Product",
    dataIndex: "product",
    key: "product",
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: "SKU",
    dataIndex: "sku",
    key: "sku",
  },
  {
    title: "Stock",
    dataIndex: "stock",
    key: "stock",
    render: (stock) => {
      if (stock > 30)
        return <span className="text-green-500">{stock} in stock</span>;
      if (stock === 0)
        return <span className="text-gray-400">Out of stock</span>;
      return <span className="text-amber-500">{stock} low stock</span>;
    },
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Rating",
    dataIndex: "rating",
    key: "rating",
    render: (rating) => (
      <span className="text-yellow-500 font-medium">{rating} ⭐</span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const color =
        status === "Publish"
          ? "green"
          : status === "Pending"
          ? "orange"
          : "default";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  { title: "Action", key: "action", render: () => <a>Edit</a> },
];

const data = [
  {
    key: "1",
    product: "Tasty Metal Shirt",
    sku: "SKU-52442",
    stock: 30,
    price: "$410.00",
    rating: 3.5,
    status: "Pending",
  },
  {
    key: "2",
    product: "Modern Gloves",
    sku: "SKU-98424",
    stock: 0,
    price: "$340.00",
    rating: 4.5,
    status: "Draft",
  },
  {
    key: "3",
    product: "Rustic Steel Computer",
    sku: "SKU-78192",
    stock: 50,
    price: "$948.00",
    rating: 3.8,
    status: "Draft",
  },
  {
    key: "4",
    product: "Licensed Concrete Cheese",
    sku: "SKU-86229",
    stock: 0,
    price: "$853.00",
    rating: 2.5,
    status: "Pending",
  },
  {
    key: "5",
    product: "Electronic Rubber Table",
    sku: "SKU-89762",
    stock: 18,
    price: "$881.00",
    rating: 4.0,
    status: "Publish",
  },
];

const ProductPage = () => {
  const navigate = useNavigate();
  // Fake Data
  const stats = [
    {
      title: "New Orders",
      value: "1,390",
      change: "+32.40%",
      icon: <Gift className="text-blue-500" />,
      up: true,
    },
    {
      title: "Sales",
      value: "$57,890",
      change: "-4.40%",
      icon: <LineChart className="text-green-500" />,
      up: false,
    },
    {
      title: "Revenue",
      value: "$12,390",
      change: "+32.40%",
      icon: <Banknote className="text-purple-500" />,
      up: true,
    },
  ];

  const profitChart = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Profit",
        data: [2000, 1500, 3200, 2800, 3600],
        borderColor: "#22C55E",
        fill: true,
        backgroundColor: "rgba(34,197,94,0.1)",
        tension: 0.4,
      },
    ],
  };

  const promoChart = {
    labels: ["YouTube", "Instagram", "Twitter", "Facebook"],
    datasets: [
      {
        data: [31.47, 26.69, 15.69, 8.22],
        backgroundColor: ["#FF0000", "#E1306C", "#1DA1F2", "#1877F2"],
      },
    ],
  };

  const topProducts = [
    { name: "Classic Casio Watch", price: "$1,290.00", rating: 5, reviews: 13 },
    {
      name: "New Wireless Headphone",
      price: "$1,000.00",
      rating: 4,
      reviews: 12,
    },
    { name: "Marc Jacob’s Decadent", price: "$220.00", rating: 3, reviews: 10 },
    {
      name: "Classic Heels For Women",
      price: "$150.90",
      rating: 5,
      reviews: 13,
    },
    { name: "Apple Watch Strap", price: "$20.00", rating: 5, reviews: 13 },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white shadow-md border-1 border-gray-200 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold">Have a nice day, Sir 👋</h1>
          <p className="text-gray-500">
            Here’s what’s happening on your store today. See the statistics at
            once.
          </p>
          <button
            onClick={() => navigate("/admin/products/add")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 cursor-pointer"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
        <img
          src="/img/admin_product_cover.jpg"
          alt="Dashboard Illustration"
          className="w-60 mr-8"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              {s.icon}
              <h2 className="text-gray-700 font-medium">{s.title}</h2>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p
              className={`text-sm ${s.up ? "text-green-500" : "text-red-500"}`}
            >
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Total Profit</h2>
          <h3 className="text-2xl font-bold mb-4">$8,950.00</h3>
          <Line data={profitChart} />
          <p className="text-gray-500 text-sm mt-3">
            Total profit without tax included.
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Promotional Sales</h2>
          <Doughnut data={promoChart} />
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="text-red-500">● YouTube</span>
            <span className="text-pink-500">● Instagram</span>
            <span className="text-blue-400">● Twitter</span>
            <span className="text-blue-700">● Facebook</span>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-5 rounded-xl shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Top Products</h2>
          <a href="#" className="text-blue-500 text-sm hover:underline">
            View All
          </a>
        </div>
        <ul className="divide-y">
          {topProducts.map((p, i) => (
            <li key={i} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-gray-500 text-sm">{p.price}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-yellow-500">
                  {"★".repeat(p.rating)}
                  {"☆".repeat(5 - p.rating)}
                </span>
                <span className="text-sm text-gray-500">
                  {p.reviews} reviews
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Stock Report */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Stock Report</h2>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </div>
    </div>
  );
};
export default ProductPage;
