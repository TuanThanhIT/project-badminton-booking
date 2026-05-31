const InputForm = ({ register, field, textHolder }: any) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={textHolder}
        {...register(field)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
      />
    </div>
  );
};

export default InputForm;
