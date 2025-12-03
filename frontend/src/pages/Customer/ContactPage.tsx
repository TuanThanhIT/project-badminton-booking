import { useForm } from "react-hook-form";
import {
  FormContactSchema,
  type formContact,
} from "../../schemas/FormContactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact2 } from "lucide-react";
import { toast } from "react-toastify";
import type { ApiErrorType } from "../../types/error";
import type { ContactRequest, ContactResponse } from "../../types/contact";
import contactService from "../../services/Customer/contactService";
import { useState } from "react";

const ContactPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<formContact>({
    resolver: zodResolver(FormContactSchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: ContactRequest) => {
    try {
      setLoading(true);
      const res = await contactService.submitContact(data);
      const dt = res.data as ContactResponse;
      toast.success(dt.message);
      setLoading(false);
      reset();
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage);
    }
  };

  return (
    <div className="flex flex-col gap-10 p-10 max-w-5xl mx-auto bg-white">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Contact2 className="w-8 h-8 text-sky-700" />
        <h1 className="text-3xl font-bold text-sky-800">Liên hệ B-Hub</h1>
      </div>

      {/* Grid container */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* Thông tin liên hệ */}
        <div className="space-y-4">
          <p className="text-lg">
            Mọi chi tiết, quý khách xin liên hệ chúng tôi theo thông tin dưới
            đây:
          </p>
          <h5 className="font-semibold text-2xl">B-Hub Việt Nam:</h5>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              <span className="font-medium">Địa chỉ:</span> 456 Nguyễn Văn Bảo,
              Quận Gò Vấp, TP.HCM
            </li>
            <li>
              <span className="font-medium">Hotline:</span>{" "}
              <a href="tel:0901234567" className="text-sky-600 hover:underline">
                0901 234 567
              </a>
            </li>
            <li>
              <span className="font-medium">Zalo:</span>{" "}
              <a
                href="https://zalo.me/0901234567"
                className="text-sky-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                0901 234 567
              </a>
            </li>
            <li>
              <span className="font-medium">Facebook:</span>{" "}
              <a
                href="https://www.facebook.com/B-Hubbadminton"
                className="text-sky-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                B-Hub Badminton
              </a>
            </li>
            <li>
              <span className="font-medium">Email:</span>{" "}
              <a
                href="mailto:support@B-Hub.vn"
                className="text-sky-600 hover:underline"
              >
                support@B-Hub.vn
              </a>
            </li>
            <li>
              <span className="font-medium">Website:</span>{" "}
              <a
                href="https://B-Hub.vn"
                className="text-sky-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                B-Hub.vn
              </a>
            </li>
          </ul>
        </div>

        {/* Form liên hệ */}
        <div className="text-gray-700">
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Họ và Tên */}
            <div className="flex flex-col">
              <label className="font-medium mb-1">Họ và tên của bạn:</label>
              <input
                placeholder="Nhập họ tên để chúng tôi biết gọi ai"
                {...register("fullName")}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="font-medium mb-1">Email:</label>
              <input
                placeholder="Nhập email để chúng tôi có thể phản hồi"
                {...register("email")}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="flex flex-col">
              <label className="font-medium mb-1">Số điện thoại:</label>
              <input
                placeholder="Nhập số điện thoại nếu muốn gọi trực tiếp"
                {...register("phoneNumber")}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Chủ đề / Thông điệp */}
            <div className="flex flex-col">
              <label className="font-medium mb-1">Chủ đề / Thông điệp:</label>
              <input
                placeholder="Viết ngắn gọn chủ đề bạn muốn gửi"
                {...register("subject")}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Nội dung */}
            <div className="flex flex-col">
              <label className="font-medium mb-1">
                Nội dung bạn muốn chia sẻ:
              </label>
              <textarea
                placeholder="Viết gì đó cho chúng tôi…"
                {...register("message")}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none h-32"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="bg-sky-600 text-white py-2 rounded-md font-semibold hover:bg-sky-700 transition-colors mt-2"
              disabled={!isValid || !isDirty}
            >
              {loading ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </form>
        </div>
      </div>

      {/* Google Map */}
      <div className="w-full h-100 rounded-lg overflow-hidden shadow-md">
        <iframe
          className="w-full h-full"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456!2d106.7746599!3d10.8603776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175279bb595922f%3A0xf6c8aa7a6266d375!2sS%C3%A2n%20C%E1%BA%A7u%20L%C3%B4ng%20SHB%20Badminton!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
        ></iframe>
      </div>
    </div>
  );
};
export default ContactPage;
