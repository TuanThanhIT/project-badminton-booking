import { CalendarClock, Truck } from "lucide-react";
import { getShippingInfo } from "../../../../utils/checkout";

const ShippingTime = ({ group }: any) => {
  const data = getShippingInfo(group);

  if (data.type === "single") {
    return <p className="text-xs text-slate-500">{data.text}</p>;
  }

  if (data.type === "same-day") {
    return (
      <div className="space-y-0.5">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Truck size={13} />
          Giao trong ngày {data.date}
        </p>
        <p className="text-xs text-slate-400">Trước {data.time}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <CalendarClock size={13} />
        {data.from} - {data.to}
      </p>
      <p className="text-xs text-slate-400">Trước {data.time}</p>
    </div>
  );
};

export default ShippingTime;
