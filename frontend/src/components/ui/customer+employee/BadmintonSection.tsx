import { useNavigate } from "react-router-dom";

const BadmintonSection = () => {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col justify-center items-center gap-5">
      <h3 className="text-3xl font-bold text-sky-800">Sản phẩm cầu lông</h3>
      <div className="w-24 h-1 rounded-full bg-gradient-to-r from-sky-500 to-sky-700 shadow-md transition-all duration-300 hover:scale-x-125 hover:shadow-lg"></div>
      <div className="grid grid-cols-4 gap-5">
        <div className="relative rounded-xl overflow-hidden group cursor-pointer">
          {/* Ảnh */}
          <img
            src="./img/votcaulong.webp"
            alt="votcaulong"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-500 flex justify-center items-center pointer-events-none">
            <button
              className="pointer-events-auto bg-sky-700 hover:bg-sky-800 shadow-lg px-6 py-2 rounded-lg text-white font-semibold text-lg transition duration-300"
              onClick={() =>
                navigate(
                  `/products?group=${encodeURIComponent("Vợt cầu lông")}`
                )
              }
            >
              Vợt cầu lông
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl group cursor-pointer">
          <img
            src="./img/giaycaulong.webp"
            alt="giaycaulong"
            className="w-full h-full object-cover transition duration group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-500 flex justify-center items-center pointer-events-none">
            <button
              className="pointer-events-auto bg-sky-700 hover:bg-sky-800 shadow-lg px-6 py-2 rounded-lg text-white font-semibold text-lg transition duration-300"
              onClick={() =>
                navigate(
                  `/products?group=${encodeURIComponent("Giày cầu lông")}`
                )
              }
            >
              Giày cầu lông
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl group cursor-pointer">
          <img
            src="./img/aocaulong.webp"
            alt="aocaulong"
            className="w-full h-full object-cover transition duration group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-500 flex justify-center items-center pointer-events-none">
            <button
              className="pointer-events-auto bg-sky-700 hover:bg-sky-800 shadow-lg px-6 py-2 rounded-lg text-white font-semibold text-lg transition duration-300"
              onClick={() =>
                navigate(`/products?group=${encodeURIComponent("Áo cầu lông")}`)
              }
            >
              Áo cầu lông
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl group cursor-pointer">
          <img
            src="./img/vaycaulong.webp"
            alt="vaycaulong"
            className="w-full h-full object-cover transition duration group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-500 flex justify-center items-center pointer-events-none">
            <button
              className="pointer-events-auto bg-sky-700 hover:bg-sky-800 shadow-lg px-6 py-2 rounded-lg text-white font-semibold text-lg transition duration-300"
              onClick={() =>
                navigate(
                  `/products?group=${encodeURIComponent("Váy cầu lông")}`
                )
              }
            >
              Váy cầu lông
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl group cursor-pointer">
          <img
            src="./img/quancaulong.webp"
            alt="quancaulong"
            className="w-full h-full object-cover transition duration group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-500 flex justify-center items-center pointer-events-none">
            <button
              className="pointer-events-auto bg-sky-700 hover:bg-sky-800 shadow-lg px-6 py-2 rounded-lg text-white font-semibold text-lg transition duration-300"
              onClick={() =>
                navigate(
                  `/products?group=${encodeURIComponent("Quần cầu lông")}`
                )
              }
            >
              Quần cầu lông
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl group cursor-pointer">
          <img
            src="./img/tuivotcaulong.webp"
            alt="tuivotcaulong"
            className="w-full h-full object-cover transition duration group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-500 flex justify-center items-center pointer-events-none">
            <button
              className="pointer-events-auto bg-sky-700 hover:bg-sky-800 shadow-lg px-6 py-2 rounded-lg text-white font-semibold text-lg transition duration-300"
              onClick={() =>
                navigate(
                  `/products?group=${encodeURIComponent("Túi vợt cầu lông")}`
                )
              }
            >
              Túi vợt cầu lông
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl group cursor-pointer">
          <img
            src="./img/balocaulong.webp"
            alt="balocaulong"
            className="w-full h-full object-cover transition duration group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-500 flex justify-center items-center pointer-events-none">
            <button
              className="pointer-events-auto bg-sky-700 hover:bg-sky-800 shadow-lg px-6 py-2 rounded-lg text-white font-semibold text-lg transition duration-300"
              onClick={() =>
                navigate(
                  `/products?group=${encodeURIComponent("Balo cầu lông")}`
                )
              }
            >
              Balo cầu lông
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl group cursor-pointer">
          <img
            src="./img/phukiencaulong.webp"
            alt="phukiencaulong"
            className="w-full h-full object-cover transition duration group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition duration-500 flex justify-center items-center pointer-events-none">
            <button
              className="pointer-events-auto bg-sky-700 hover:bg-sky-800 shadow-lg px-6 py-2 rounded-lg text-white font-semibold text-lg transition duration-300"
              onClick={() =>
                navigate(
                  `/products?group=${encodeURIComponent("Phụ kiện cầu lông")}`
                )
              }
            >
              Phụ kiện cầu lông
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default BadmintonSection;
