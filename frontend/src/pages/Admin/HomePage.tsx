import React from "react";
import HomeDataCard from "../../components/commons/admin/HomeDataCard";
import { data } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
const HomePage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row gap-4 w-full">
        <div className="flex-1 ">
          <HomeDataCard
            title="title1"
            value="20"
            comparison_percentage="2%"
            chart_data={{
              labels: ["Used", "Remaining"],
              datasets: [
                {
                  data: [32, 68],
                  backgroundColor: ["#3B82F6", "#E5E7EB"],
                  borderWidth: 0,
                },
              ],
            }}
          />
        </div>
        <div className="flex-1 ">
          <HomeDataCard
            title="title1"
            value="20"
            comparison_percentage="2%"
            chart_data={{
              labels: ["Used", "Remaining"],
              datasets: [
                {
                  data: [32, 68],
                  backgroundColor: ["#3B82F6", "#E5E7EB"],
                  borderWidth: 0,
                },
              ],
            }}
          />
        </div>
        <div className="flex-1 ">
          <HomeDataCard
            title="title1"
            value="20"
            comparison_percentage="2%"
            chart_data={{
              labels: ["Used", "Remaining"],
              datasets: [
                {
                  data: [32, 68],
                  backgroundColor: ["#3B82F6", "#E5E7EB"],
                  borderWidth: 0,
                },
              ],
            }}
          />
        </div>
        <div className="flex-1 ">
          <HomeDataCard
            title="title1"
            value="20"
            comparison_percentage="2%"
            chart_data={{
              labels: ["Used", "Remaining"],
              datasets: [
                {
                  data: [32, 68],
                  backgroundColor: ["#3B82F6", "#E5E7EB"],
                  borderWidth: 0,
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default HomePage;
