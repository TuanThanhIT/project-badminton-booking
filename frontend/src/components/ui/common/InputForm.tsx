const InputForm = ({ register, error, field }: any) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Mật khẩu"
        {...register(field)}
        className="w-full border border-gray-400 p-2 px-4 rounded-md outline-none pr-10"
      />

      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default InputForm;
