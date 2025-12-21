interface ItemListProps {
  items: any[];
  activeTab: "beverage" | "product";
  onAdd: (item: any) => void;
  onRemove: (item: any) => void;
}

const ItemList = ({ items, activeTab, onAdd, onRemove }: ItemListProps) => {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.id}
          className={`w-full p-3 rounded-xl border flex items-center gap-4 ${
            activeTab === "beverage"
              ? "bg-blue-50 border-blue-200"
              : "bg-sky-50 border-sky-200"
          }`}
        >
          <img
            src={item.thumbnailUrl}
            className="w-16 h-16 rounded-lg object-cover"
          />

          <div className="flex-1">
            <p className="font-semibold">
              {activeTab === "beverage" ? item.name : item.productName}
            </p>
            <p className="text-orange-600 font-bold">
              {item.price?.toLocaleString()}đ
            </p>
            <p className="text-xs text-gray-500">
              Còn lại: <b>{item.stock ?? 0}</b>
            </p>
          </div>

          {/* === BUTTONS: DỄ BẤM HƠN === */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onAdd(item)}
              className="w-10 h-10 rounded-full bg-green-600 text-white 
                         flex items-center justify-center text-lg font-bold
                         hover:bg-green-700 active:scale-95 transition"
            >
              +
            </button>

            <button
              onClick={() => onRemove(item)}
              className="w-10 h-10 rounded-full bg-red-500 text-white 
                         flex items-center justify-center text-lg font-bold
                         hover:bg-red-600 active:scale-95 transition"
            >
              –
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default ItemList;
