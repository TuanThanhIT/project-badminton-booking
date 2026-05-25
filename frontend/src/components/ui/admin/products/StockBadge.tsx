const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0) return <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-red-50 text-red-600 border-red-200">Hết hàng</span>;
  if (stock < 10) return <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-yellow-50 text-yellow-700 border-yellow-200">{stock} còn lại</span>;
  return <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-green-50 text-green-700 border-green-200">{stock} còn lại</span>;
};

export default StockBadge;
