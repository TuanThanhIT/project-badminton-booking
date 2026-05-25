type AdminStatusBadgeProps = {
  color: string;
  label: string;
};

const AdminStatusBadge = ({ color, label }: AdminStatusBadgeProps) => (
  <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-semibold ${color}`}>
    {label}
  </span>
);

export default AdminStatusBadge;
