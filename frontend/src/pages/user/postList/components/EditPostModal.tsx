import type { PostWithAuthor } from "../../../../types/post";
import CreateFindPlayerPostForm from "../../CreateFindPlayerPostForm";
import CreateClassPostForm from "../../CreateClassPostForm";
import CreateTournamentPostForm from "../../CreateTournamentPostForm";
import CreateGroupPostForm from "../../CreateGroupPostForm";

type EditTarget = {
  id: number;
  type: PostWithAuthor["type"];
  title: string;
  content?: string | null;
  formData?: any;
} | null;

type EditPostModalProps = {
  editTarget: EditTarget;
  onClose: () => void;
  onSave: (postId: number, payload: any) => Promise<void>;
};

const EditPostModal = ({ editTarget, onClose, onSave }: EditPostModalProps) => {
  if (!editTarget) return null;

  const commonProps = {
    submitText: "Luu thay doi",
    redirectOnSuccess: false,
  };

  const renderForm = () => {
    if (editTarget.type === "Find_player") {
      return (
        <CreateFindPlayerPostForm
          {...commonProps}
          initialValues={{
            title: editTarget.title,
            content: editTarget.content || "",
            type: "Find_player",
            formData: editTarget.formData,
          }}
          onSubmitForm={async (dt) =>
            onSave(editTarget.id, {
              title: dt.title,
              content: dt.content,
              formData: dt.formData,
            })
          }
        />
      );
    }
    if (editTarget.type === "Class") {
      return (
        <CreateClassPostForm
          {...commonProps}
          initialValues={{
            title: editTarget.title,
            content: editTarget.content || "",
            type: "Class",
            formData: editTarget.formData,
          }}
          onSubmitForm={async (dt) =>
            onSave(editTarget.id, {
              title: dt.title,
              content: dt.content,
              formData: dt.formData,
            })
          }
        />
      );
    }
    if (editTarget.type === "Tournament") {
      return (
        <CreateTournamentPostForm
          {...commonProps}
          initialValues={{
            title: editTarget.title,
            content: editTarget.content || "",
            type: "Tournament",
            formData: editTarget.formData,
          }}
          onSubmitForm={async (dt) =>
            onSave(editTarget.id, {
              title: dt.title,
              content: dt.content,
              formData: dt.formData,
            })
          }
        />
      );
    }
    if (editTarget.type === "Group") {
      return (
        <CreateGroupPostForm
          {...commonProps}
          initialValues={{
            title: editTarget.title,
            content: editTarget.content || "",
            type: "Group",
            formData: editTarget.formData,
          }}
          onSubmitForm={async (dt) =>
            onSave(editTarget.id, {
              title: dt.title,
              content: dt.content,
              formData: dt.formData,
            })
          }
        />
      );
    }

    return <p className="text-sm text-gray-500">Loai bai nay chua ho tro chinh sua.</p>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Chinh sua bai dang</h3>
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded border">
            Dong
          </button>
        </div>
        {renderForm()}
      </div>
    </div>
  );
};

export default EditPostModal;
