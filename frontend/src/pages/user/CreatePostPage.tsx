import { useState } from "react";
import type { PostType } from "../../types/post";
import CreateFindPlayerPostForm from "./CreateFindPlayerPostForm";
import CreateClassPostForm from "./CreateClassPostForm";
import CreateTournamentPostForm from "./CreateTournamentPostForm";
import CreateGroupPostForm from "./CreateGroupPostForm";

const POST_TYPE_LABEL: Record<PostType, string> = {
  FIND_PLAYER: "Tìm người chơi cùng",
  TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm",
  FIND_COACH: "Tìm HLV",
  CLASS: "Lớp học",
};

const AVAILABLE_TYPES: PostType[] = ["FIND_PLAYER", "CLASS", "TOURNAMENT", "GROUP"];

const CreatePostPage = () => {
  const [selectedType, setSelectedType] = useState<PostType>("FIND_PLAYER");

  const renderForm = () => {
    switch (selectedType) {
      case "FIND_PLAYER":
        return <CreateFindPlayerPostForm />;
      case "CLASS":
        return <CreateClassPostForm />;
      case "TOURNAMENT":
        return <CreateTournamentPostForm />;
      case "GROUP":
        return <CreateGroupPostForm />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Đăng bài</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {AVAILABLE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-t-md text-sm font-medium
              ${
                selectedType === type
                  ? "bg-white border-x border-t border-gray-200 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {POST_TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
        {renderForm()}
      </div>
    </div>
  );
};

export default CreatePostPage;