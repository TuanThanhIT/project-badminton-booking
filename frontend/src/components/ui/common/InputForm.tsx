const InputForm = ({ register, field, textHolder }: any) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={textHolder}
        {...register(field)}
        className="w-full border border-gray-400 p-2 px-4 rounded-md outline-none pr-10"
      />
    </div>
  );
};

export default InputForm;
