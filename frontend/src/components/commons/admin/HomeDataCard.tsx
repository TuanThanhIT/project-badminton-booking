import Chart from "chart.js/auto";
import type { ChartData } from "chart.js";
import { Doughnut } from "react-chartjs-2";

type HomeDataCardProps = {
  title: string;
  value: string;
  comparison_percentage: string;
  chart_data: ChartData<"doughnut">;
  center_text?: string;
};
const doughnutLabel = {
  id: "doughnutLabel",
  afterDatasetsDraw(chart: any) {
    const { ctx, chartArea } = chart;

    if (!chartArea) return;

    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    // text
    ctx.save();
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Tham số", centerX, centerY);
    ctx.restore();
  },
};

function HomeDataCard({
  title,
  value,
  comparison_percentage,
  chart_data,
  center_text,
}: HomeDataCardProps) {
  return (
    <div className="grid grid-cols-2 border-2 rounded-md border-gray-100 h-32 w-68 place-items-center">
      <div className=" flex flex-col ">
        <div>
          <p>{title}</p>
        </div>
        <div>
          <p className="font-bold">{value}</p>
        </div>
        <div>{comparison_percentage}</div>
      </div>
      <div className="h-25 w-25 p-3">
        <Doughnut
          data={chart_data}
          options={{
            cutout: "75%",
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
          }}
          plugins={[doughnutLabel]}
        />
      </div>
    </div>
  );
}
export default HomeDataCard;
