const BadmintonSection = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <h3 className="text-3xl font-bold text-sky-800">Sản phẩm cầu lông</h3>
      <div className="w-20 h-1 fex justify-between bg-sky-500 rounded-3xl"></div>
      <div className="grid grid-cols-4 gap-10">
        <div className="w-full bg-sky-200 p-4 text-center">Cột 1</div>
        <div className="w-full bg-sky-300 p-4 text-center">Cột 2</div>
        <div className="w-full bg-sky-400 p-4 text-center">Cột 3</div>
        <div className="w-full bg-sky-500 p-4 text-center">Cột 4</div>
      </div>
    </div>
  );
};
export default BadmintonSection;
