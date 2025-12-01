interface ItemListProps {
  items: any[];
  activeTab: "beverage" | "product";
  onAdd: (item: any) => void;
}

const ItemList = ({ items, activeTab, onAdd }: ItemListProps) => {
  return (
    <>
      {items.map((item) => (
        <div
          key={activeTab === "beverage" ? item.id : item.sku}
          className={`w-full p-3 rounded-xl border flex items-center gap-4 ${
            activeTab === "beverage"
              ? "bg-blue-50 border-blue-200"
              : "bg-sky-50 border-sky-200"
          }`}
        >
          <img
            src={item.thumbnailUrl}
            alt="thumbnail"
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          />
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-800">
              {activeTab === "beverage" ? item.name : item.productName}
            </p>
            <p className="text-sm font-medium text-gray-600">
              {activeTab === "beverage" ? (
                <span className="text-orange-600 font-bold">
                  {item.price.toLocaleString()}đ
                </span>
              ) : (
                <div className="flex flex-col gap-1 text-sm text-gray-700">
                  <span className="font-semibold text-orange-600">
                    {item.price?.toLocaleString()}đ
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>
                      <span className="font-bold">Size:</span> {item.size}
                    </span>
                    <span>
                      <span className="font-bold">Màu:</span> {item.color}
                    </span>
                    <span>
                      <span className="font-bold">Chất liệu:</span>{" "}
                      {item.material}
                    </span>
                  </div>
                </div>
              )}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Còn lại:{" "}
              <span className="text-green-600 font-semibold">
                {item.stock ?? 0}
              </span>
            </p>
          </div>
          <button
            className="px-4 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 shadow transition"
            onClick={() => onAdd(item)}
          >
            Thêm
          </button>
        </div>
      ))}
    </>
  );
};
export default ItemList;
