import UserAvatar from "./UserAvatar";

type AdminUserCellProps = {
  avatar?: string;
  fullName?: string;
  username?: string;
  email?: string;
};

const AdminUserCell = ({ avatar, fullName, username, email }: AdminUserCellProps) => (
  <div className="flex items-center gap-2">
    <UserAvatar
      src={avatar}
      name={fullName || username || "?"}
      className="w-8 h-8 rounded-lg border border-gray-200"
    />
    <div>
      <p className="font-medium text-gray-800 text-xs">{fullName || username}</p>
      <p className="text-xs text-gray-400">{email || (username ? `@${username}` : "")}</p>
    </div>
  </div>
);

export default AdminUserCell;
