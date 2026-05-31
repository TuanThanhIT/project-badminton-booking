import { FilePenLine, X } from "lucide-react";
import type { PostWithAuthor } from "../../../../types/post";
import CreateFindPlayerPostForm from "./CreateFindPlayerPostForm";
import CreateClassPostForm from "./CreateClassPostForm";
import CreateTournamentPostForm from "./CreateTournamentPostForm";
import CreateGroupPostForm from "./CreateGroupPostForm";
import { POST_TYPE_LABEL } from "../../../../utils/constants/postConstant";

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
    submitText: "Lưu thay đổi",
    redirectOnSuccess: false,
  };

  const renderForm = () => {
    const baseValues = {
      title: editTarget.title,
      content: editTarget.content || "",
      formData: editTarget.formData,
    };

    if (editTarget.type === "FIND_PLAYER") {
      return (
        <CreateFindPlayerPostForm
          {...commonProps}
          initialValues={{
            ...baseValues,
            type: "FIND_PLAYER",
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

    if (editTarget.type === "CLASS") {
      return (
        <CreateClassPostForm
          {...commonProps}
          initialValues={{
            ...baseValues,
            type: "CLASS",
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

    if (editTarget.type === "TOURNAMENT") {
      return (
        <CreateTournamentPostForm
          {...commonProps}
          initialValues={{
            ...baseValues,
            type: "TOURNAMENT",
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

    if (editTarget.type === "GROUP") {
      return (
        <CreateGroupPostForm
          {...commonProps}
          initialValues={{
            ...baseValues,
            type: "GROUP",
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

    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Loại bài này chưa hỗ trợ chỉnh sửa.
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <FilePenLine size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold text-slate-900">
                Chỉnh sửa bài đăng
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {POST_TYPE_LABEL[editTarget.type]} · Cập nhật nội dung và thông tin bài đăng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
