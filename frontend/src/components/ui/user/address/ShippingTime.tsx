import { getShippingInfo } from "../../../../utils/checkout";

const ShippingTime = ({ group }: any) => {
  const data = getShippingInfo(group);

  if (data.type === "single") {
    return <p className="text-xs text-gray-500">{data.text}</p>;
  }

  if (data.type === "same-day") {
    return (
      <>
        <p className="text-xs text-green-600 font-medium">
          🚀 Giao trong ngày {data.date}
        </p>
        <p className="text-xs text-gray-400">Trước {data.time}</p>
      </>
    );
  }

  return (
    <>
      <p className="text-xs text-gray-600">
        📦 {data.from} - {data.to}
      </p>
      <p className="text-xs text-gray-400">Trước {data.time}</p>
    </>
  );
};

export default ShippingTime;
