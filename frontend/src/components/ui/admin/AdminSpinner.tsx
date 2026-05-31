const AdminSpinner = ({ size = 8 }: { size?: number }) => (
  <div className="flex justify-center py-14">
    <div
      className={`w-${size} h-${size} border-4 border-sky-500 border-t-transparent rounded-full animate-spin`}
    />
  </div>
);

export default AdminSpinner;
