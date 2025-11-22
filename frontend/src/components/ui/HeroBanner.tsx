import { useEffect, useState } from "react";

const images = [
  "/img/banner.webp",
  "/img/banner1.webp",
  "/img/banner2.webp",
  "/img/banner3.webp",
  "/img/banner4.webp",
];

const HeroBanner = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-screen overflow-hidden select-none">
      {/* Slider wrapper */}
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Banner ${i + 1}`}
            className="flex-shrink-0 w-full h-auto object-contain"
          />
        ))}
      </div>

      {/* Nút Prev */}
      <button
        onClick={prev}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-white p-4 rounded-full shadow-lg transition z-20"
      >
        ❮
      </button>

      {/* Nút Next */}
      <button
        onClick={next}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-white p-4 rounded-full shadow-lg transition z-20"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 w-full flex justify-center gap-3 z-20">
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-300
              ${i === index ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
