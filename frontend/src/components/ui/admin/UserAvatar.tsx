import { useState, useEffect } from "react";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  className?: string;
}

const UserAvatar = ({ src, name, className = "w-10 h-10 rounded-xl" }: UserAvatarProps) => {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [src]);
  const letter = (name || "?").charAt(0).toUpperCase();

  return (
    <div className={`${className} overflow-hidden shrink-0 bg-sky-100 flex items-center justify-center`}>
      {src?.trim() && !error ? (
        <img src={src.trim()} alt="" className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        <span className="text-sm font-semibold text-sky-700 select-none leading-none">{letter}</span>
      )}
    </div>
  );
};

export default UserAvatar;
